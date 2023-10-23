setwd("/classifier")
#### Generating Beta values #####
suppressMessages(library(tidyverse))
suppressMessages(library(minfi))
suppressMessages(library(RSpectra))
suppressMessages(library(ggplot2))
suppressMessages(library(plotly))
suppressMessages(library(gapminder))
suppressMessages(library(ggrepel))
suppressMessages(library(uwot))
suppressMessages(library(stringi))
suppressMessages(library(reshape))
suppressMessages(library(rmarkdown))
suppressMessages(library(kableExtra))
suppressMessages(library(lemon))
suppressMessages(library(formattable))
suppressMessages(library(e1071))
suppressMessages(library(IlluminaHumanMethylationEPICanno.ilm10b4.hg19))
set.seed(123)

print(renv::status())

source(file.path("files/RSpectra_pca.R"))
source("files/methylclassifierpackage_source.R")

### get samplesheet and targets file in shape
targets =c();
infiles = list.files(path = "/input", pattern = "_Grn.idat.gz$|_Grn.idat$");
fsizes  = file.info(file.path("/input", infiles))$size
for(k in 1:length(fsizes)){
 if(fsizes[k] < 5000000){
   stop("Feels like wrong array, may be HumanMethylation450 ?\n ", infiles[k], "\nFile size:\t", fsizes[k], "\n");
 }
}
targets$Sample_Name = gsub("_Grn.idat.gz$|_Grn.idat$",  "", infiles, perl=TRUE)
targets$idat        = targets$Sample_Name;
targets$Sex         = rep(NA, length(targets$Sample_Name));

for(i in 1:length(targets$idat)){
  targets$Slide[i] = head(tail(unlist(str_split(targets$idat[i], "_")), n=2), n=1);
  targets$Sentrix_position[i] = tail(unlist(str_split(targets$idat[i], "_")), n=1);
}

targets$Basename = paste0("/input/", targets$idat)
targets <- as.data.frame(targets)
targets <- separate(targets, Sentrix_position, into = c("sentrix_row", "sentrix_col"), sep = 3, remove = TRUE)
targets$sentrix_row = gsub("\\R", "", targets$sentrix_row)
targets$sentrix_col = gsub("\\C", "", targets$sentrix_col)
targets$Slide <- as.numeric(as.character(targets$Slide))
targets <- targets %>% filter(!is.na(Basename))
targets <- targets %>% filter(!duplicated(Basename))
targets$Material_Type = "Frozen";

samplesheets=c()
if(file.exists("/input/Sample_Sheet.csv")){
    samplestouse <- read.csv("/input/Sample_Sheet.csv", header=T, skip=7);
    samplestouse$idat <- paste0(samplestouse$Sentrix_ID, "_", samplestouse$Sentrix_Position);
    samplesheets = rbind(samplesheets,samplestouse);
      for(idat in samplestouse$idat){
         targets[targets$idat == idat, "Sample_Name"]    <- samplestouse[samplestouse$idat == idat, "Sample_Name"];
         targets[targets$idat == idat, "Sex"]            <- samplestouse[samplestouse$idat == idat, "Gender"];
         targets[targets$idat == idat, "Material_Type"]  <- samplestouse[samplestouse$idat == idat, "Material_Type"];
       }
    message(" Loaded DNA and gender from /input/Sample_Sheet.csv");
 }else if(file.exists("/input/newsamples.txt")) {
    samplestouse <- read.csv("/input/newsamples.txt", header=T, sep="\t");
    colnames(samplestouse) <- c("Sample_Name", "idat");
    for(idat in samplestouse$idat){
         targets[targets$idat == idat, "Sample_Name"]    <- samplestouse[samplestouse$idat == idat, "Sample_Name"];
    }
    message(" Loaded DNA from /input/newsamples.txt");
 }else{
    message("/input/ has no samplesheet provided. Use sentrix barcode as Sample id.\n");
};
targets$Material_Type[targets$Material_Type!="FFPE"]<-"Frozen";
samplesheets <- samplesheets[!is.na(samplesheets$Sentrix_ID),]


week_anno           <- as.data.frame(targets[c("Sample_Name", "idat", "Basename")]) ;
week_anno$new.class <- rep("tst", nrow(week_anno));
week_anno$group     <- week_anno$Sample_Name;
week_anno$class     <- NA;
week_anno$family    <- NA;
row.names(week_anno)<- week_anno$idat;
names(week_anno)[1] <- "Sample";
names(week_anno)[2] <- "idat_filename";

message("Processing new samples to RGset with minfi noob norm...");
RGset  <- read.metharray.exp(targets = week_anno,force = TRUE,recursive = TRUE);
Mset_raw <- preprocessRaw(RGset);
manifest <- getManifest(RGset)@annotation;
if( manifest == "IlluminaHumanMethylationEPICv2" ){
  MSet <- preprocessIllumina(RGset);
  message("EPICv2 is running with Illumina standard normalization.\n The classifier model training set used preprocessNoob.\n   Warning !!! You may need to upgrade minfi library one day.");
}else if( manifest == "IlluminaHumanMethylationEPIC"){
  message("EPICv1 is the old friend better than 10 new ones.");
  MSet   <- preprocessNoob(RGset,dyeMethod = "single");
}else{
  message("Your chip is may be not quite right: ", manifest);
  MSet   <- preprocessNoob(RGset,dyeMethod = "single");
};


weekly_beta_value <- getBeta(MSet);

## Harcore filling gaps mostly for EPICv2 cases
for (i in 1:ncol(weekly_beta_value)) {
  colx <- weekly_beta_value[, i ]
  colx[is.na(colx)] <- median(colx, na.rm = TRUE)
  weekly_beta_value[, i ] <- colx;
};

betas_week        <- t(weekly_beta_value)

### Making UMAP #####
base_betas <- readRDS("files/base_betas.rds")
base_anno  <- read.csv("files/refset_7467.csv")
week_annox <- week_anno;
row.names(week_annox) <- gsub("_", "x_", rownames(week_annox))
anno       <- rbind(base_anno, week_annox[,-3]);

betas_week <- betas_week[,colnames(base_betas),drop = FALSE];
betas <- rbind(base_betas,betas_week);
betas <- betas[anno$idat_filename,];


message("Dimensionality reduction with RSpectra_pca.R for UMAP figure...");
pca <- prcomp_svds(betas,k=200);

umap  <- uwot::umap(pca$x,n_neighbors =10,n_components = 4,metric = "cosine",min_dist = 0,spread=1);
umap  <- as.data.frame(umap);
umap  <- cbind(umap,anno);
umap1 <- umap[umap$new.class!="tst",];

load("files/my.col.RData");
my.col<-my.col
if(length(setdiff(unique(umap1$new.class), names(my.col)))>0){
  newcols <- rainbow(length(setdiff(unique(umap1$new.class), names(my.col))), alpha=0.7, start=runif(n=1, min=0.001, max=.099))
  names(newcols) <- setdiff(unique(umap1$new.class), names(my.col))
  my.col <-c(my.col,newcols);
}


#cluster labels will be used in UMAP at rmd file later ## color = my.col[[x]] # toRGB("black")
dim.center = aggregate(subset(umap1, select= c("V1", "V2", "V3", "V4")), list(umap1$new.class), median);
colnames(dim.center)[1] = "cancer";
xy1_annotations = lapply(unique(dim.center$cancer), function(x){
  idx = which(dim.center$cancer == x)
  ann = list(showarrow = F, x = dim.center$V1[idx], y = dim.center$V2[idx],
             text = paste0("<b>", dim.center$cancer[idx], "</b>"),
             bgcolor = alpha("white", 0.5),
             font = list(size = 8, family = 'arial', color = "black") ); 
  ann;
})
xy2_annotations = lapply(unique(dim.center$cancer), function(x){
  idx = which(dim.center$cancer == x)
  ann = list(showarrow = F, x = dim.center$V3[idx], y = dim.center$V4[idx],
             text = paste0("<b>",dim.center$cancer[idx],"</b>"),
             bgcolor = alpha("white", 0.5),
             font = list(size = 8, family = "helvetica", color = my.col[[x]]));
  ann;
})
wmap <- umap[umap$new.class=="tst",];
query_vector <- row.names(wmap);


rm(betas);
invisible(gc());

###################################################################
###  Bin graded Classifier Run by Omkar
message("Loading data for 20 models and running classifiers...");
betas1 <- t(weekly_beta_value);
if(nrow(betas1)==1){
  betas2 <- rbind(betas1,betas1) 
  row.names(betas2)[2] <- "x";
}else{
  betas2 <- betas1
}
rm(betas1);
invisible(gc())


load("files/data.RData");

pred_all<-mainpredict(betas2,mod = family_all$mod,calibratemod = family_all$glmnet.calfit)
pred_G1 <-mainpredict(betas2,mod = G1_all$mod,calibratemod  = G1_all$glmnet.calfit)
pred_G2 <-mainpredict(betas2,mod = G2_all$mod,calibratemod  = G2_all$glmnet.calfit)
pred_G3 <-mainpredict(betas2,mod = G3_all$mod,calibratemod  = G3_all$glmnet.calfit)
pred_G4 <-mainpredict(betas2,mod = G4_all$mod,calibratemod  = G4_all$glmnet.calfit)
pred_G5 <-mainpredict(betas2,mod = G5_all$mod,calibratemod  = G5_all$glmnet.calfit)
pred_G6 <-mainpredict(betas2,mod = G6_all$mod,calibratemod  = G6_all$glmnet.calfit)
pred_G7 <-mainpredict(betas2,mod = G7_all$mod,calibratemod  = G7_all$glmnet.calfit)
pred_G8 <-mainpredict(betas2,mod = G8_all$mod,calibratemod  = G8_all$glmnet.calfit)
pred_G9 <-mainpredict(betas2,mod = G9_all$mod,calibratemod  = G9_all$glmnet.calfit)
pred_G10<-mainpredict(betas2,mod = G10_all$mod,calibratemod = G10_all$glmnet.calfit)
pred_G11<-mainpredict(betas2,mod = G11_all$mod,calibratemod = G11_all$glmnet.calfit)
pred_G12<-mainpredict(betas2,mod = G12_all$mod,calibratemod = G12_all$glmnet.calfit)
pred_G13<-mainpredict(betas2,mod = G13_all$mod,calibratemod = G13_all$glmnet.calfit)
pred_G14<-mainpredict(betas2,mod = G14_all$mod,calibratemod = G14_all$glmnet.calfit)
pred_G15<-mainpredict(betas2,mod = G15_all$mod,calibratemod = G15_all$glmnet.calfit)
pred_G16<-mainpredict(betas2,mod = G16_all$mod,calibratemod = G16_all$glmnet.calfit)
pred_G17<-mainpredict(betas2,mod = G17_all$mod,calibratemod = G17_all$glmnet.calfit)
pred_G18<-mainpredict(betas2,mod = G18_all$mod,calibratemod = G18_all$glmnet.calfit)
pred_G19<-mainpredict(betas2,mod = G19_all$mod,calibratemod = G19_all$glmnet.calfit)
pred_G20<-mainpredict(betas2,mod = G20_all$mod,calibratemod = G20_all$glmnet.calfit)

rm(family_all, G1_all,  G2_all,  G3_all,  G4_all,  G5_all,  G6_all,  G7_all, 
       G8_all, G9_all,  G10_all, G11_all, G12_all, G13_all, G14_all, G15_all, 
	  G16_all, G17_all, G18_all, G19_all, G20_all );
invisible(gc());

df<-cbind(pred_G1$probs,
          pred_G2$probs,
          pred_G3$probs,
          pred_G4$probs,
          pred_G5$probs,
          pred_G6$probs,
          pred_G7$probs,
          pred_G8$probs,
          pred_G9$probs,
          pred_G10$probs,
          pred_G11$probs,
          pred_G12$probs,
          pred_G13$probs,
          pred_G14$probs,
          pred_G15$probs,
          pred_G16$probs,
          pred_G17$probs,
          pred_G18$probs,
          pred_G19$probs,
          pred_G20$probs)

df<-t(df)

DF<-as.data.frame(pred_all$probs)
kk<-as.data.frame(pred_all$pres)
row.names(kk)<-row.names(DF)
#DF$SVM<-pred_SVM$pres
kk$SVM_score<-rowMaxs(as.matrix(DF))
colnames(kk)<-c("Methylation_group_prediction","Methylation_score")

kk
ss<-row.names(kk)

datalist1<-list()
datalist2<-list()

for (i in ss) {
  
  cf <- tumor_group_table[tumor_group_table$Tumor_group==kk[i,1],]
  cf <- df[row.names(cf),]
  cf <- cf[,i,drop=FALSE ]
  rowname_max <- rownames(cf)[which(cf == max(cf),  # Extract row name of max
                                    arr.ind = TRUE)[ , 1]]
  colname_max <- colMaxs(cf)
  datalist1[i]<-rowname_max
  datalist2[i]<-colname_max
  
}

#
bf1<-do.call(rbind,datalist1)
bf2<-do.call(rbind,datalist2)
bf<-cbind(bf1,bf2)
bf<-as.data.frame(bf)
colnames(bf)<-c("Methylation_Class","Class_Score")
kk<-kk[row.names(bf),]
final_results<-cbind(kk,bf)
final_results<-final_results[row.names(week_anno),]
final_results$Class_Score<-as.numeric(final_results$Class_Score)
final_results$combi<-paste(final_results$Methylation_group_prediction,final_results$Methylation_Class,sep = "@")
final_results$combi_score<-(final_results$Methylation_score+final_results$Class_Score)/2
final_results$combi_score<-rowMeans(final_results[,c('Methylation_score', 'Class_Score')], na.rm=TRUE)
all_probes_results<-final_results
colnames(all_probes_results)<-c("super_family","super_family_score","class","class_Score","combi","combi_score")


### body

pred_all<-mainpredict(betas2,mod = family_body$mod,calibratemod = family_body$glmnet.calfit)
pred_G1<-mainpredict(betas2,mod = G1_body$mod,calibratemod = G1_body$glmnet.calfit)
pred_G2<-mainpredict(betas2,mod = G2_body$mod,calibratemod = G2_body$glmnet.calfit)
pred_G3<-mainpredict(betas2,mod = G3_body$mod,calibratemod = G3_body$glmnet.calfit)
pred_G4<-mainpredict(betas2,mod = G4_body$mod,calibratemod = G4_body$glmnet.calfit)
pred_G5<-mainpredict(betas2,mod = G5_body$mod,calibratemod = G5_body$glmnet.calfit)
pred_G6<-mainpredict(betas2,mod = G6_body$mod,calibratemod = G6_body$glmnet.calfit)
pred_G7<-mainpredict(betas2,mod = G7_body$mod,calibratemod = G7_body$glmnet.calfit)
pred_G8<-mainpredict(betas2,mod = G8_body$mod,calibratemod = G8_body$glmnet.calfit)
pred_G9<-mainpredict(betas2,mod = G9_body$mod,calibratemod = G9_body$glmnet.calfit)
pred_G10<-mainpredict(betas2,mod = G10_body$mod,calibratemod = G10_body$glmnet.calfit)
pred_G11<-mainpredict(betas2,mod = G11_body$mod,calibratemod = G11_body$glmnet.calfit)
pred_G12<-mainpredict(betas2,mod = G12_body$mod,calibratemod = G12_body$glmnet.calfit)
pred_G13<-mainpredict(betas2,mod = G13_body$mod,calibratemod = G13_body$glmnet.calfit)
pred_G14<-mainpredict(betas2,mod = G14_body$mod,calibratemod = G14_body$glmnet.calfit)
pred_G15<-mainpredict(betas2,mod = G15_body$mod,calibratemod = G15_body$glmnet.calfit)
pred_G16<-mainpredict(betas2,mod = G16_body$mod,calibratemod = G16_body$glmnet.calfit)
pred_G17<-mainpredict(betas2,mod = G17_body$mod,calibratemod = G17_body$glmnet.calfit)
pred_G18<-mainpredict(betas2,mod = G18_body$mod,calibratemod = G18_body$glmnet.calfit)
pred_G19<-mainpredict(betas2,mod = G19_body$mod,calibratemod = G19_body$glmnet.calfit)
pred_G20<-mainpredict(betas2,mod = G20_body$mod,calibratemod = G20_body$glmnet.calfit)

rm(family_body, G1_body,  G2_body,  G3_body,  G4_body,  G5_body,  G6_body,  
       G7_body, G8_body,  G9_body,  G10_body, G11_body, G12_body, G13_body, 
      G14_body, G15_body, G16_body, G17_body, G18_body, G19_body, G20_body);
invisible(gc());

df<-cbind(pred_G1$probs,
          pred_G2$probs,
          pred_G3$probs,
          pred_G4$probs,
          pred_G5$probs,
          pred_G6$probs,
          pred_G7$probs,
          pred_G8$probs,
          pred_G9$probs,
          pred_G10$probs,
          pred_G11$probs,
          pred_G12$probs,
          pred_G13$probs,
          pred_G14$probs,
          pred_G15$probs,
          pred_G16$probs,
          pred_G17$probs,
          pred_G18$probs,
          pred_G19$probs,
          pred_G20$probs)

df<-t(df)

DF<-as.data.frame(pred_all$probs)
kk<-as.data.frame(pred_all$pres)
row.names(kk)<-row.names(DF)
#DF$SVM<-pred_SVM$pres
kk$SVM_score<-rowMaxs(as.matrix(DF))
colnames(kk)<-c("Methylation_group_prediction","Methylation_score")

kk
ss<-row.names(kk)

datalist1<-list()
datalist2<-list()

for (i in ss) {
  
  cf<- tumor_group_table[tumor_group_table$Tumor_group==kk[i,1],]
  cf<-df[row.names(cf),]
  cf<-cf[,i,drop=FALSE ]
  rowname_max <- rownames(cf)[which(cf == max(cf),  # Extract row name of max
                                    arr.ind = TRUE)[ , 1]]
  colname_max <- colMaxs(cf)
  datalist1[i]<-rowname_max
  datalist2[i]<-colname_max
  
}

#
bf1<-do.call(rbind,datalist1)
bf2<-do.call(rbind,datalist2)
bf<-cbind(bf1,bf2)
bf<-as.data.frame(bf)
colnames(bf)<-c("Methylation_Class","Class_Score")
kk<-kk[row.names(bf),]
final_results<-cbind(kk,bf)
final_results<-final_results[row.names(week_anno),]
final_results$Class_Score<-as.numeric(final_results$Class_Score)
final_results$combi<-paste(final_results$Methylation_group_prediction,final_results$Methylation_Class,sep = "@")
final_results$combi_score<-(final_results$Methylation_score+final_results$Class_Score)/2
final_results$combi_score<-rowMeans(final_results[,c('Methylation_score', 'Class_Score')], na.rm=TRUE)
body_results<-final_results
colnames(body_results)<-c("super_family","super_family_score","class","class_Score","combi","combi_score")


### shelf
pred_all<-mainpredict(betas2,mod = family_shelf$mod,calibratemod = family_shelf$glmnet.calfit)
pred_G1<-mainpredict(betas2,mod = G1_shelf$mod,calibratemod = G1_shelf$glmnet.calfit)
pred_G2<-mainpredict(betas2,mod = G2_shelf$mod,calibratemod = G2_shelf$glmnet.calfit)
pred_G3<-mainpredict(betas2,mod = G3_shelf$mod,calibratemod = G3_shelf$glmnet.calfit)
pred_G4<-mainpredict(betas2,mod = G4_shelf$mod,calibratemod = G4_shelf$glmnet.calfit)
pred_G5<-mainpredict(betas2,mod = G5_shelf$mod,calibratemod = G5_shelf$glmnet.calfit)
pred_G6<-mainpredict(betas2,mod = G6_shelf$mod,calibratemod = G6_shelf$glmnet.calfit)
pred_G7<-mainpredict(betas2,mod = G7_shelf$mod,calibratemod = G7_shelf$glmnet.calfit)
pred_G8<-mainpredict(betas2,mod = G8_shelf$mod,calibratemod = G8_shelf$glmnet.calfit)
pred_G9<-mainpredict(betas2,mod = G9_shelf$mod,calibratemod = G9_shelf$glmnet.calfit)
pred_G10<-mainpredict(betas2,mod = G10_shelf$mod,calibratemod = G10_shelf$glmnet.calfit)
pred_G11<-mainpredict(betas2,mod = G11_shelf$mod,calibratemod = G11_shelf$glmnet.calfit)
pred_G12<-mainpredict(betas2,mod = G12_shelf$mod,calibratemod = G12_shelf$glmnet.calfit)
pred_G13<-mainpredict(betas2,mod = G13_shelf$mod,calibratemod = G13_shelf$glmnet.calfit)
pred_G14<-mainpredict(betas2,mod = G14_shelf$mod,calibratemod = G14_shelf$glmnet.calfit)
pred_G15<-mainpredict(betas2,mod = G15_shelf$mod,calibratemod = G15_shelf$glmnet.calfit)
pred_G16<-mainpredict(betas2,mod = G16_shelf$mod,calibratemod = G16_shelf$glmnet.calfit)
pred_G17<-mainpredict(betas2,mod = G17_shelf$mod,calibratemod = G17_shelf$glmnet.calfit)
pred_G18<-mainpredict(betas2,mod = G18_shelf$mod,calibratemod = G18_shelf$glmnet.calfit)
pred_G19<-mainpredict(betas2,mod = G19_shelf$mod,calibratemod = G19_shelf$glmnet.calfit)
pred_G20<-mainpredict(betas2,mod = G20_shelf$mod,calibratemod = G20_shelf$glmnet.calfit)

rm(family_shelf, G1_shelf,  G2_shelf,  G3_shelf,  G4_shelf,  G5_shelf,  G6_shelf,  
       G7_shelf, G8_shelf,  G9_shelf,  G10_shelf, G11_shelf, G12_shelf, G13_shelf, 
      G14_shelf, G15_shelf, G16_shelf, G17_shelf, G18_shelf, G19_shelf, G20_shelf);
invisible(gc());

df<-cbind(pred_G1$probs,
          pred_G2$probs,
          pred_G3$probs,
          pred_G4$probs,
          pred_G5$probs,
          pred_G6$probs,
          pred_G7$probs,
          pred_G8$probs,
          pred_G9$probs,
          pred_G10$probs,
          pred_G11$probs,
          pred_G12$probs,
          pred_G13$probs,
          pred_G14$probs,
          pred_G15$probs,
          pred_G16$probs,
          pred_G17$probs,
          pred_G18$probs,
          pred_G19$probs,
          pred_G20$probs)
df<-t(df)

DF<-as.data.frame(pred_all$probs)
kk<-as.data.frame(pred_all$pres)
row.names(kk)<-row.names(DF)
#DF$SVM<-pred_SVM$pres
kk$SVM_score<-rowMaxs(as.matrix(DF))
colnames(kk)<-c("Methylation_group_prediction","Methylation_score")

kk
ss<-row.names(kk)

datalist1<-list()
datalist2<-list()

for (i in ss) {
  
  cf<- tumor_group_table[tumor_group_table$Tumor_group==kk[i,1],]
  cf<-df[row.names(cf),]
  cf<-cf[,i,drop=FALSE ]
  rowname_max <- rownames(cf)[which(cf == max(cf),  # Extract row name of max
                                    arr.ind = TRUE)[ , 1]]
  colname_max <- colMaxs(cf)
  datalist1[i]<-rowname_max
  datalist2[i]<-colname_max
  
}

#
bf1<-do.call(rbind,datalist1)
bf2<-do.call(rbind,datalist2)
bf<-cbind(bf1,bf2)
bf<-as.data.frame(bf)
colnames(bf)<-c("Methylation_Class","Class_Score")
kk<-kk[row.names(bf),]
final_results<-cbind(kk,bf)
final_results<-final_results[row.names(week_anno),]
final_results$Class_Score<-as.numeric(final_results$Class_Score)
final_results$combi<-paste(final_results$Methylation_group_prediction,final_results$Methylation_Class,sep = "@")
final_results$combi_score<-(final_results$Methylation_score+final_results$Class_Score)/2
final_results$combi_score<-rowMeans(final_results[,c('Methylation_score', 'Class_Score')], na.rm=TRUE)
shelf_results<-final_results
colnames(shelf_results)<-c("super_family","super_family_score","class","class_Score","combi","combi_score")


### ogr
pred_all<-mainpredict(betas2,mod = family_ogr$mod,calibratemod = family_ogr$glmnet.calfit)
pred_G1<-mainpredict(betas2,mod = G1_ogr$mod,calibratemod = G1_ogr$glmnet.calfit)
pred_G2<-mainpredict(betas2,mod = G2_ogr$mod,calibratemod = G2_ogr$glmnet.calfit)
pred_G3<-mainpredict(betas2,mod = G3_ogr$mod,calibratemod = G3_ogr$glmnet.calfit)
pred_G4<-mainpredict(betas2,mod = G4_ogr$mod,calibratemod = G4_ogr$glmnet.calfit)
pred_G5<-mainpredict(betas2,mod = G5_ogr$mod,calibratemod = G5_ogr$glmnet.calfit)
pred_G6<-mainpredict(betas2,mod = G6_ogr$mod,calibratemod = G6_ogr$glmnet.calfit)
pred_G7<-mainpredict(betas2,mod = G7_ogr$mod,calibratemod = G7_ogr$glmnet.calfit)
pred_G8<-mainpredict(betas2,mod = G8_ogr$mod,calibratemod = G8_ogr$glmnet.calfit)
pred_G9<-mainpredict(betas2,mod = G9_ogr$mod,calibratemod = G9_ogr$glmnet.calfit)
pred_G10<-mainpredict(betas2,mod = G10_ogr$mod,calibratemod = G10_ogr$glmnet.calfit)
pred_G11<-mainpredict(betas2,mod = G11_ogr$mod,calibratemod = G11_ogr$glmnet.calfit)
pred_G12<-mainpredict(betas2,mod = G12_ogr$mod,calibratemod = G12_ogr$glmnet.calfit)
pred_G13<-mainpredict(betas2,mod = G13_ogr$mod,calibratemod = G13_ogr$glmnet.calfit)
pred_G14<-mainpredict(betas2,mod = G14_ogr$mod,calibratemod = G14_ogr$glmnet.calfit)
pred_G15<-mainpredict(betas2,mod = G15_ogr$mod,calibratemod = G15_ogr$glmnet.calfit)
pred_G16<-mainpredict(betas2,mod = G16_ogr$mod,calibratemod = G16_ogr$glmnet.calfit)
pred_G17<-mainpredict(betas2,mod = G17_ogr$mod,calibratemod = G17_ogr$glmnet.calfit)
pred_G18<-mainpredict(betas2,mod = G18_ogr$mod,calibratemod = G18_ogr$glmnet.calfit)
pred_G19<-mainpredict(betas2,mod = G19_ogr$mod,calibratemod = G19_ogr$glmnet.calfit)
pred_G20<-mainpredict(betas2,mod = G20_ogr$mod,calibratemod = G20_ogr$glmnet.calfit)

rm(family_ogr, G1_ogr,  G2_ogr,  G3_ogr,  G4_ogr,  G5_ogr,  G6_ogr,  
       G7_ogr, G8_ogr,  G9_ogr,  G10_ogr, G11_ogr, G12_ogr, G13_ogr, 
      G14_ogr, G15_ogr, G16_ogr, G17_ogr, G18_ogr, G19_ogr, G20_ogr);
invisible(gc());

df<-cbind(pred_G1$probs,
          pred_G2$probs,
          pred_G3$probs,
          pred_G4$probs,
          pred_G5$probs,
          pred_G6$probs,
          pred_G7$probs,
          pred_G8$probs,
          pred_G9$probs,
          pred_G10$probs,
          pred_G11$probs,
          pred_G12$probs,
          pred_G13$probs,
          pred_G14$probs,
          pred_G15$probs,
          pred_G16$probs,
          pred_G17$probs,
          pred_G18$probs,
          pred_G19$probs,
          pred_G20$probs)

df<-t(df)

DF<-as.data.frame(pred_all$probs)
kk<-as.data.frame(pred_all$pres)
row.names(kk)<-row.names(DF)
#DF$SVM<-pred_SVM$pres
kk$SVM_score<-rowMaxs(as.matrix(DF))
colnames(kk)<-c("Methylation_group_prediction","Methylation_score")

kk
ss<-row.names(kk)

datalist1<-list()
datalist2<-list()

for (i in ss) {
  
  cf<- tumor_group_table[tumor_group_table$Tumor_group==kk[i,1],]
  cf<-df[row.names(cf),]
  cf<-cf[,i,drop=FALSE ]
  rowname_max <- rownames(cf)[which(cf == max(cf),  # Extract row name of max
                                    arr.ind = TRUE)[ , 1]]
  colname_max <- colMaxs(cf)
  datalist1[i]<-rowname_max
  datalist2[i]<-colname_max
  
}

#
bf1<-do.call(rbind,datalist1)
bf2<-do.call(rbind,datalist2)
bf<-cbind(bf1,bf2)
bf<-as.data.frame(bf)
colnames(bf)<-c("Methylation_Class","Class_Score")
kk<-kk[row.names(bf),]
final_results<-cbind(kk,bf)
final_results<-final_results[row.names(week_anno),]
final_results$Class_Score<-as.numeric(final_results$Class_Score)
final_results$combi<-paste(final_results$Methylation_group_prediction,final_results$Methylation_Class,sep = "@")
final_results$combi_score<-(final_results$Methylation_score+final_results$Class_Score)/2
final_results$combi_score<-rowMeans(final_results[,c('Methylation_score', 'Class_Score')], na.rm=TRUE)
ogr_results<-final_results
colnames(ogr_results)<-c("super_family","super_family_score","class","class_Score","combi","combi_score")



### shore
pred_all<-mainpredict(betas2,mod = family_shore$mod,calibratemod = family_shore$glmnet.calfit)
pred_G1<-mainpredict(betas2,mod = G1_shore$mod,calibratemod = G1_shore$glmnet.calfit)
pred_G2<-mainpredict(betas2,mod = G2_shore$mod,calibratemod = G2_shore$glmnet.calfit)
pred_G3<-mainpredict(betas2,mod = G3_shore$mod,calibratemod = G3_shore$glmnet.calfit)
pred_G4<-mainpredict(betas2,mod = G4_shore$mod,calibratemod = G4_shore$glmnet.calfit)
pred_G5<-mainpredict(betas2,mod = G5_shore$mod,calibratemod = G5_shore$glmnet.calfit)
pred_G6<-mainpredict(betas2,mod = G6_shore$mod,calibratemod = G6_shore$glmnet.calfit)
pred_G7<-mainpredict(betas2,mod = G7_shore$mod,calibratemod = G7_shore$glmnet.calfit)
pred_G8<-mainpredict(betas2,mod = G8_shore$mod,calibratemod = G8_shore$glmnet.calfit)
pred_G9<-mainpredict(betas2,mod = G9_shore$mod,calibratemod = G9_shore$glmnet.calfit)
pred_G10<-mainpredict(betas2,mod = G10_shore$mod,calibratemod = G10_shore$glmnet.calfit)
pred_G11<-mainpredict(betas2,mod = G11_shore$mod,calibratemod = G11_shore$glmnet.calfit)
pred_G12<-mainpredict(betas2,mod = G12_shore$mod,calibratemod = G12_shore$glmnet.calfit)
pred_G13<-mainpredict(betas2,mod = G13_shore$mod,calibratemod = G13_shore$glmnet.calfit)
pred_G14<-mainpredict(betas2,mod = G14_shore$mod,calibratemod = G14_shore$glmnet.calfit)
pred_G15<-mainpredict(betas2,mod = G15_shore$mod,calibratemod = G15_shore$glmnet.calfit)
pred_G16<-mainpredict(betas2,mod = G16_shore$mod,calibratemod = G16_shore$glmnet.calfit)
pred_G17<-mainpredict(betas2,mod = G17_shore$mod,calibratemod = G17_shore$glmnet.calfit)
pred_G18<-mainpredict(betas2,mod = G18_shore$mod,calibratemod = G18_shore$glmnet.calfit)
pred_G19<-mainpredict(betas2,mod = G19_shore$mod,calibratemod = G19_shore$glmnet.calfit)
pred_G20<-mainpredict(betas2,mod = G20_shore$mod,calibratemod = G20_shore$glmnet.calfit)

rm(family_shore, G1_shore,  G2_shore,  G3_shore,  G4_shore,  G5_shore,  G6_shore,  
       G7_shore, G8_shore,  G9_shore,  G10_shore, G11_shore, G12_shore, G13_shore, 
      G14_shore, G15_shore, G16_shore, G17_shore, G18_shore, G19_shore, G20_shore);
invisible(gc());

df<-cbind(pred_G1$probs,
          pred_G2$probs,
          pred_G3$probs,
          pred_G4$probs,
          pred_G5$probs,
          pred_G6$probs,
          pred_G7$probs,
          pred_G8$probs,
          pred_G9$probs,
          pred_G10$probs,
          pred_G11$probs,
          pred_G12$probs,
          pred_G13$probs,
          pred_G14$probs,
          pred_G15$probs,
          pred_G16$probs,
          pred_G17$probs,
          pred_G18$probs,
          pred_G19$probs,
          pred_G20$probs)

df<-t(df)

DF<-as.data.frame(pred_all$probs)
kk<-as.data.frame(pred_all$pres)
row.names(kk)<-row.names(DF)
#DF$SVM<-pred_SVM$pres
kk$SVM_score<-rowMaxs(as.matrix(DF))
colnames(kk)<-c("Methylation_group_prediction","Methylation_score")

kk
ss<-row.names(kk)

datalist1<-list()
datalist2<-list()

for (i in ss) {
  
  cf<- tumor_group_table[tumor_group_table$Tumor_group==kk[i,1],]
  cf<-df[row.names(cf),]
  cf<-cf[,i,drop=FALSE ]
  rowname_max <- rownames(cf)[which(cf == max(cf),  # Extract row name of max
                                    arr.ind = TRUE)[ , 1]]
  colname_max <- colMaxs(cf)
  datalist1[i]<-rowname_max
  datalist2[i]<-colname_max
  
}

#
bf1<-do.call(rbind,datalist1)
bf2<-do.call(rbind,datalist2)
bf<-cbind(bf1,bf2)
bf<-as.data.frame(bf)
colnames(bf)<-c("Methylation_Class","Class_Score")
kk<-kk[row.names(bf),]
final_results<-cbind(kk,bf)
final_results<-final_results[row.names(week_anno),]
final_results$Class_Score<-as.numeric(final_results$Class_Score)
final_results$combi<-paste(final_results$Methylation_group_prediction,final_results$Methylation_Class,sep = "@")
final_results$combi_score<-(final_results$Methylation_score+final_results$Class_Score)/2
final_results$combi_score<-rowMeans(final_results[,c('Methylation_score', 'Class_Score')], na.rm=TRUE)
shore_results<-final_results
colnames(shore_results)<-c("super_family","super_family_score","class","class_Score","combi","combi_score")


### opensea
pred_all<-mainpredict(betas2,mod = family_opensea$mod,calibratemod = family_opensea$glmnet.calfit)
pred_G1<-mainpredict(betas2,mod = G1_opensea$mod,calibratemod = G1_opensea$glmnet.calfit)
pred_G2<-mainpredict(betas2,mod = G2_opensea$mod,calibratemod = G2_opensea$glmnet.calfit)
pred_G3<-mainpredict(betas2,mod = G3_opensea$mod,calibratemod = G3_opensea$glmnet.calfit)
pred_G4<-mainpredict(betas2,mod = G4_opensea$mod,calibratemod = G4_opensea$glmnet.calfit)
pred_G5<-mainpredict(betas2,mod = G5_opensea$mod,calibratemod = G5_opensea$glmnet.calfit)
pred_G6<-mainpredict(betas2,mod = G6_opensea$mod,calibratemod = G6_opensea$glmnet.calfit)
pred_G7<-mainpredict(betas2,mod = G7_opensea$mod,calibratemod = G7_opensea$glmnet.calfit)
pred_G8<-mainpredict(betas2,mod = G8_opensea$mod,calibratemod = G8_opensea$glmnet.calfit)
pred_G9<-mainpredict(betas2,mod = G9_opensea$mod,calibratemod = G9_opensea$glmnet.calfit)
pred_G10<-mainpredict(betas2,mod = G10_opensea$mod,calibratemod = G10_opensea$glmnet.calfit)
pred_G11<-mainpredict(betas2,mod = G11_opensea$mod,calibratemod = G11_opensea$glmnet.calfit)
pred_G12<-mainpredict(betas2,mod = G12_opensea$mod,calibratemod = G12_opensea$glmnet.calfit)
pred_G13<-mainpredict(betas2,mod = G13_opensea$mod,calibratemod = G13_opensea$glmnet.calfit)
pred_G14<-mainpredict(betas2,mod = G14_opensea$mod,calibratemod = G14_opensea$glmnet.calfit)
pred_G15<-mainpredict(betas2,mod = G15_opensea$mod,calibratemod = G15_opensea$glmnet.calfit)
pred_G16<-mainpredict(betas2,mod = G16_opensea$mod,calibratemod = G16_opensea$glmnet.calfit)
pred_G17<-mainpredict(betas2,mod = G17_opensea$mod,calibratemod = G17_opensea$glmnet.calfit)
pred_G18<-mainpredict(betas2,mod = G18_opensea$mod,calibratemod = G18_opensea$glmnet.calfit)
pred_G19<-mainpredict(betas2,mod = G19_opensea$mod,calibratemod = G19_opensea$glmnet.calfit)
pred_G20<-mainpredict(betas2,mod = G20_opensea$mod,calibratemod = G20_opensea$glmnet.calfit)

rm(family_opensea, G1_opensea,  G2_opensea,  G3_opensea,  G4_opensea,  G5_opensea,  G6_opensea,  
       G7_opensea, G8_opensea,  G9_opensea,  G10_opensea, G11_opensea, G12_opensea, G13_opensea, 
      G14_opensea, G15_opensea, G16_opensea, G17_opensea, G18_opensea, G19_opensea, G20_opensea);
invisible(gc());

df<-cbind(pred_G1$probs,
          pred_G2$probs,
          pred_G3$probs,
          pred_G4$probs,
          pred_G5$probs,
          pred_G6$probs,
          pred_G7$probs,
          pred_G8$probs,
          pred_G9$probs,
          pred_G10$probs,
          pred_G11$probs,
          pred_G12$probs,
          pred_G13$probs,
          pred_G14$probs,
          pred_G15$probs,
          pred_G16$probs,
          pred_G17$probs,
          pred_G18$probs,
          pred_G19$probs,
          pred_G20$probs)

df<-t(df)

DF<-as.data.frame(pred_all$probs)
kk<-as.data.frame(pred_all$pres)
row.names(kk)<-row.names(DF)
#DF$SVM<-pred_SVM$pres
kk$SVM_score<-rowMaxs(as.matrix(DF))
colnames(kk)<-c("Methylation_group_prediction","Methylation_score")

kk
ss<-row.names(kk)

datalist1<-list()
datalist2<-list()

for (i in ss) {
  
  cf<- tumor_group_table[tumor_group_table$Tumor_group==kk[i,1],]
  cf<-df[row.names(cf),]
  cf<-cf[,i,drop=FALSE ]
  rowname_max <- rownames(cf)[which(cf == max(cf),  # Extract row name of max
                                    arr.ind = TRUE)[ , 1]]
  colname_max <- colMaxs(cf)
  datalist1[i]<-rowname_max
  datalist2[i]<-colname_max
  
}

#
bf1<-do.call(rbind,datalist1)
bf2<-do.call(rbind,datalist2)
bf<-cbind(bf1,bf2)
bf<-as.data.frame(bf)
colnames(bf)<-c("Methylation_Class","Class_Score")
kk<-kk[row.names(bf),]
final_results<-cbind(kk,bf)
final_results<-final_results[row.names(week_anno),]
final_results$Class_Score<-as.numeric(final_results$Class_Score)
final_results$combi<-paste(final_results$Methylation_group_prediction,final_results$Methylation_Class,sep = "@")
final_results$combi_score<-(final_results$Methylation_score+final_results$Class_Score)/2
final_results$combi_score<-rowMeans(final_results[,c('Methylation_score', 'Class_Score')], na.rm=TRUE)
opensea_results<-final_results
colnames(opensea_results)<-c("super_family","super_family_score","class","class_Score","combi","combi_score")


### island
pred_all<-mainpredict(betas2,mod = family_island$mod,calibratemod = family_island$glmnet.calfit)
pred_G1<-mainpredict(betas2,mod = G1_island$mod,calibratemod = G1_island$glmnet.calfit)
pred_G2<-mainpredict(betas2,mod = G2_island$mod,calibratemod = G2_island$glmnet.calfit)
pred_G3<-mainpredict(betas2,mod = G3_island$mod,calibratemod = G3_island$glmnet.calfit)
pred_G4<-mainpredict(betas2,mod = G4_island$mod,calibratemod = G4_island$glmnet.calfit)
pred_G5<-mainpredict(betas2,mod = G5_island$mod,calibratemod = G5_island$glmnet.calfit)
pred_G6<-mainpredict(betas2,mod = G6_island$mod,calibratemod = G6_island$glmnet.calfit)
pred_G7<-mainpredict(betas2,mod = G7_island$mod,calibratemod = G7_island$glmnet.calfit)
pred_G8<-mainpredict(betas2,mod = G8_island$mod,calibratemod = G8_island$glmnet.calfit)
pred_G9<-mainpredict(betas2,mod = G9_island$mod,calibratemod = G9_island$glmnet.calfit)
pred_G10<-mainpredict(betas2,mod = G10_island$mod,calibratemod = G10_island$glmnet.calfit)
pred_G11<-mainpredict(betas2,mod = G11_island$mod,calibratemod = G11_island$glmnet.calfit)
pred_G12<-mainpredict(betas2,mod = G12_island$mod,calibratemod = G12_island$glmnet.calfit)
pred_G13<-mainpredict(betas2,mod = G13_island$mod,calibratemod = G13_island$glmnet.calfit)
pred_G14<-mainpredict(betas2,mod = G14_island$mod,calibratemod = G14_island$glmnet.calfit)
pred_G15<-mainpredict(betas2,mod = G15_island$mod,calibratemod = G15_island$glmnet.calfit)
pred_G16<-mainpredict(betas2,mod = G16_island$mod,calibratemod = G16_island$glmnet.calfit)
pred_G17<-mainpredict(betas2,mod = G17_island$mod,calibratemod = G17_island$glmnet.calfit)
pred_G18<-mainpredict(betas2,mod = G18_island$mod,calibratemod = G18_island$glmnet.calfit)
pred_G19<-mainpredict(betas2,mod = G19_island$mod,calibratemod = G19_island$glmnet.calfit)
pred_G20<-mainpredict(betas2,mod = G20_island$mod,calibratemod = G20_island$glmnet.calfit)

rm(family_island, G1_island,  G2_island,  G3_island,  G4_island,  G5_island,  G6_island,  
       G7_island, G8_island,  G9_island,  G10_island, G11_island, G12_island, G13_island, 
      G14_island, G15_island, G16_island, G17_island, G18_island, G19_island, G20_island);
invisible(gc());

df<-cbind(pred_G1$probs,
          pred_G2$probs,
          pred_G3$probs,
          pred_G4$probs,
          pred_G5$probs,
          pred_G6$probs,
          pred_G7$probs,
          pred_G8$probs,
          pred_G9$probs,
          pred_G10$probs,
          pred_G11$probs,
          pred_G12$probs,
          pred_G13$probs,
          pred_G14$probs,
          pred_G15$probs,
          pred_G16$probs,
          pred_G17$probs,
          pred_G18$probs,
          pred_G19$probs,
          pred_G20$probs)

df<-t(df)

DF<-as.data.frame(pred_all$probs)
kk<-as.data.frame(pred_all$pres)
row.names(kk)<-row.names(DF)
#DF$SVM<-pred_SVM$pres
kk$SVM_score<-rowMaxs(as.matrix(DF))
colnames(kk)<-c("Methylation_group_prediction","Methylation_score")

kk
ss<-row.names(kk)

datalist1<-list()
datalist2<-list()

for (i in ss) {
  
  cf<- tumor_group_table[tumor_group_table$Tumor_group==kk[i,1],]
  cf<-df[row.names(cf),]
  cf<-cf[,i,drop=FALSE ]
  rowname_max <- rownames(cf)[which(cf == max(cf),  # Extract row name of max
                                    arr.ind = TRUE)[ , 1]]
  colname_max <- colMaxs(cf)
  datalist1[i]<-rowname_max
  datalist2[i]<-colname_max
  
}

#
bf1<-do.call(rbind,datalist1)
bf2<-do.call(rbind,datalist2)
bf<-cbind(bf1,bf2)
bf<-as.data.frame(bf)
colnames(bf)<-c("Methylation_Class","Class_Score")
kk<-kk[row.names(bf),]
final_results<-cbind(kk,bf)
final_results<-final_results[row.names(week_anno),]
final_results$Class_Score<-as.numeric(final_results$Class_Score)
final_results$combi<-paste(final_results$Methylation_group_prediction,final_results$Methylation_Class,sep = "@")
final_results$combi_score<-(final_results$Methylation_score+final_results$Class_Score)/2
final_results$combi_score<-rowMeans(final_results[,c('Methylation_score', 'Class_Score')], na.rm=TRUE)
island_results<-final_results
colnames(island_results)<-c("super_family","super_family_score","class","class_Score","combi","combi_score")


### utr5
pred_all<-mainpredict(betas2,mod = family_utr5$mod,calibratemod = family_utr5$glmnet.calfit)
pred_G1<-mainpredict(betas2,mod = G1_utr5$mod,calibratemod = G1_utr5$glmnet.calfit)
pred_G2<-mainpredict(betas2,mod = G2_utr5$mod,calibratemod = G2_utr5$glmnet.calfit)
pred_G3<-mainpredict(betas2,mod = G3_utr5$mod,calibratemod = G3_utr5$glmnet.calfit)
pred_G4<-mainpredict(betas2,mod = G4_utr5$mod,calibratemod = G4_utr5$glmnet.calfit)
pred_G5<-mainpredict(betas2,mod = G5_utr5$mod,calibratemod = G5_utr5$glmnet.calfit)
pred_G6<-mainpredict(betas2,mod = G6_utr5$mod,calibratemod = G6_utr5$glmnet.calfit)
pred_G7<-mainpredict(betas2,mod = G7_utr5$mod,calibratemod = G7_utr5$glmnet.calfit)
pred_G8<-mainpredict(betas2,mod = G8_utr5$mod,calibratemod = G8_utr5$glmnet.calfit)
pred_G9<-mainpredict(betas2,mod = G9_utr5$mod,calibratemod = G9_utr5$glmnet.calfit)
pred_G10<-mainpredict(betas2,mod = G10_utr5$mod,calibratemod = G10_utr5$glmnet.calfit)
pred_G11<-mainpredict(betas2,mod = G11_utr5$mod,calibratemod = G11_utr5$glmnet.calfit)
pred_G12<-mainpredict(betas2,mod = G12_utr5$mod,calibratemod = G12_utr5$glmnet.calfit)
pred_G13<-mainpredict(betas2,mod = G13_utr5$mod,calibratemod = G13_utr5$glmnet.calfit)
pred_G14<-mainpredict(betas2,mod = G14_utr5$mod,calibratemod = G14_utr5$glmnet.calfit)
pred_G15<-mainpredict(betas2,mod = G15_utr5$mod,calibratemod = G15_utr5$glmnet.calfit)
pred_G16<-mainpredict(betas2,mod = G16_utr5$mod,calibratemod = G16_utr5$glmnet.calfit)
pred_G17<-mainpredict(betas2,mod = G17_utr5$mod,calibratemod = G17_utr5$glmnet.calfit)
pred_G18<-mainpredict(betas2,mod = G18_utr5$mod,calibratemod = G18_utr5$glmnet.calfit)
pred_G19<-mainpredict(betas2,mod = G19_utr5$mod,calibratemod = G19_utr5$glmnet.calfit)
pred_G20<-mainpredict(betas2,mod = G20_utr5$mod,calibratemod = G20_utr5$glmnet.calfit)

rm(family_utr5, G1_utr5,  G2_utr5,  G3_utr5,  G4_utr5,  G5_utr5,  G6_utr5,  
       G7_utr5, G8_utr5,  G9_utr5,  G10_utr5, G11_utr5, G12_utr5, G13_utr5, 
      G14_utr5, G15_utr5, G16_utr5, G17_utr5, G18_utr5, G19_utr5, G20_utr5);
invisible(gc());

df<-cbind(pred_G1$probs,
          pred_G2$probs,
          pred_G3$probs,
          pred_G4$probs,
          pred_G5$probs,
          pred_G6$probs,
          pred_G7$probs,
          pred_G8$probs,
          pred_G9$probs,
          pred_G10$probs,
          pred_G11$probs,
          pred_G12$probs,
          pred_G13$probs,
          pred_G14$probs,
          pred_G15$probs,
          pred_G16$probs,
          pred_G17$probs,
          pred_G18$probs,
          pred_G19$probs,
          pred_G20$probs)

df<-t(df)

DF<-as.data.frame(pred_all$probs)
kk<-as.data.frame(pred_all$pres)
row.names(kk)<-row.names(DF)
#DF$SVM<-pred_SVM$pres
kk$SVM_score<-rowMaxs(as.matrix(DF))
colnames(kk)<-c("Methylation_group_prediction","Methylation_score")

kk
ss<-row.names(kk)

datalist1<-list()
datalist2<-list()

for (i in ss) {
  
  cf<- tumor_group_table[tumor_group_table$Tumor_group==kk[i,1],]
  cf<-df[row.names(cf),]
  cf<-cf[,i,drop=FALSE ]
  rowname_max <- rownames(cf)[which(cf == max(cf),  # Extract row name of max
                                    arr.ind = TRUE)[ , 1]]
  colname_max <- colMaxs(cf)
  datalist1[i]<-rowname_max
  datalist2[i]<-colname_max
  
}

#
bf1<-do.call(rbind,datalist1)
bf2<-do.call(rbind,datalist2)
bf<-cbind(bf1,bf2)
bf<-as.data.frame(bf)
colnames(bf)<-c("Methylation_Class","Class_Score")
kk<-kk[row.names(bf),]
final_results<-cbind(kk,bf)
final_results<-final_results[row.names(week_anno),]
final_results$Class_Score<-as.numeric(final_results$Class_Score)
final_results$combi<-paste(final_results$Methylation_group_prediction,final_results$Methylation_Class,sep = "@")
final_results$combi_score<-(final_results$Methylation_score+final_results$Class_Score)/2
final_results$combi_score<-rowMeans(final_results[,c('Methylation_score', 'Class_Score')], na.rm=TRUE)
utr5_results<-final_results
colnames(utr5_results)<-c("super_family","super_family_score","class","class_Score","combi","combi_score")



### ocec
pred_all<-mainpredict(betas2,mod = family_ocec$mod,calibratemod = family_ocec$glmnet.calfit)
pred_G1<-mainpredict(betas2,mod = G1_ocec$mod,calibratemod = G1_ocec$glmnet.calfit)
pred_G2<-mainpredict(betas2,mod = G2_ocec$mod,calibratemod = G2_ocec$glmnet.calfit)
pred_G3<-mainpredict(betas2,mod = G3_ocec$mod,calibratemod = G3_ocec$glmnet.calfit)
pred_G4<-mainpredict(betas2,mod = G4_ocec$mod,calibratemod = G4_ocec$glmnet.calfit)
pred_G5<-mainpredict(betas2,mod = G5_ocec$mod,calibratemod = G5_ocec$glmnet.calfit)
pred_G6<-mainpredict(betas2,mod = G6_ocec$mod,calibratemod = G6_ocec$glmnet.calfit)
pred_G7<-mainpredict(betas2,mod = G7_ocec$mod,calibratemod = G7_ocec$glmnet.calfit)
pred_G8<-mainpredict(betas2,mod = G8_ocec$mod,calibratemod = G8_ocec$glmnet.calfit)
pred_G9<-mainpredict(betas2,mod = G9_ocec$mod,calibratemod = G9_ocec$glmnet.calfit)
pred_G10<-mainpredict(betas2,mod = G10_ocec$mod,calibratemod = G10_ocec$glmnet.calfit)
pred_G11<-mainpredict(betas2,mod = G11_ocec$mod,calibratemod = G11_ocec$glmnet.calfit)
pred_G12<-mainpredict(betas2,mod = G12_ocec$mod,calibratemod = G12_ocec$glmnet.calfit)
pred_G13<-mainpredict(betas2,mod = G13_ocec$mod,calibratemod = G13_ocec$glmnet.calfit)
pred_G14<-mainpredict(betas2,mod = G14_ocec$mod,calibratemod = G14_ocec$glmnet.calfit)
pred_G15<-mainpredict(betas2,mod = G15_ocec$mod,calibratemod = G15_ocec$glmnet.calfit)
pred_G16<-mainpredict(betas2,mod = G16_ocec$mod,calibratemod = G16_ocec$glmnet.calfit)
pred_G17<-mainpredict(betas2,mod = G17_ocec$mod,calibratemod = G17_ocec$glmnet.calfit)
pred_G18<-mainpredict(betas2,mod = G18_ocec$mod,calibratemod = G18_ocec$glmnet.calfit)
pred_G19<-mainpredict(betas2,mod = G19_ocec$mod,calibratemod = G19_ocec$glmnet.calfit)
pred_G20<-mainpredict(betas2,mod = G20_ocec$mod,calibratemod = G20_ocec$glmnet.calfit)

rm(family_ocec, G1_ocec,  G2_ocec,  G3_ocec,  G4_ocec,  G5_ocec,  G6_ocec,  
       G7_ocec, G8_ocec,  G9_ocec,  G10_ocec, G11_ocec, G12_ocec, G13_ocec, 
      G14_ocec, G15_ocec, G16_ocec, G17_ocec, G18_ocec, G19_ocec, G20_ocec);
invisible(gc());

df<-cbind(pred_G1$probs,
          pred_G2$probs,
          pred_G3$probs,
          pred_G4$probs,
          pred_G5$probs,
          pred_G6$probs,
          pred_G7$probs,
          pred_G8$probs,
          pred_G9$probs,
          pred_G10$probs,
          pred_G11$probs,
          pred_G12$probs,
          pred_G13$probs,
          pred_G14$probs,
          pred_G15$probs,
          pred_G16$probs,
          pred_G17$probs,
          pred_G18$probs,
          pred_G19$probs,
          pred_G20$probs)

df<-t(df)

DF<-as.data.frame(pred_all$probs)
kk<-as.data.frame(pred_all$pres)
row.names(kk)<-row.names(DF)
#DF$SVM<-pred_SVM$pres
kk$SVM_score<-rowMaxs(as.matrix(DF))
colnames(kk)<-c("Methylation_group_prediction","Methylation_score")

kk
ss<-row.names(kk)

datalist1<-list()
datalist2<-list()

for (i in ss) {
  
  cf<- tumor_group_table[tumor_group_table$Tumor_group==kk[i,1],]
  cf<-df[row.names(cf),]
  cf<-cf[,i,drop=FALSE ]
  rowname_max <- rownames(cf)[which(cf == max(cf),  # Extract row name of max
                                    arr.ind = TRUE)[ , 1]]
  colname_max <- colMaxs(cf)
  datalist1[i]<-rowname_max
  datalist2[i]<-colname_max
  
}

#
bf1<-do.call(rbind,datalist1)
bf2<-do.call(rbind,datalist2)
bf<-cbind(bf1,bf2)
bf<-as.data.frame(bf)
colnames(bf)<-c("Methylation_Class","Class_Score")
kk<-kk[row.names(bf),]
final_results<-cbind(kk,bf)
final_results<-final_results[row.names(week_anno),]
final_results$Class_Score<-as.numeric(final_results$Class_Score)
final_results$combi<-paste(final_results$Methylation_group_prediction,final_results$Methylation_Class,sep = "@")
final_results$combi_score<-(final_results$Methylation_score+final_results$Class_Score)/2
final_results$combi_score<-rowMeans(final_results[,c('Methylation_score', 'Class_Score')], na.rm=TRUE)
ocec_results<-final_results
colnames(ocec_results)<-c("super_family","super_family_score","class","class_Score","combi","combi_score")



### tss
pred_all<-mainpredict(betas2,mod = family_tss$mod,calibratemod = family_tss$glmnet.calfit)
pred_G1<-mainpredict(betas2,mod = G1_tss$mod,calibratemod = G1_tss$glmnet.calfit)
pred_G2<-mainpredict(betas2,mod = G2_tss$mod,calibratemod = G2_tss$glmnet.calfit)
pred_G3<-mainpredict(betas2,mod = G3_tss$mod,calibratemod = G3_tss$glmnet.calfit)
pred_G4<-mainpredict(betas2,mod = G4_tss$mod,calibratemod = G4_tss$glmnet.calfit)
pred_G5<-mainpredict(betas2,mod = G5_tss$mod,calibratemod = G5_tss$glmnet.calfit)
pred_G6<-mainpredict(betas2,mod = G6_tss$mod,calibratemod = G6_tss$glmnet.calfit)
pred_G7<-mainpredict(betas2,mod = G7_tss$mod,calibratemod = G7_tss$glmnet.calfit)
pred_G8<-mainpredict(betas2,mod = G8_tss$mod,calibratemod = G8_tss$glmnet.calfit)
pred_G9<-mainpredict(betas2,mod = G9_tss$mod,calibratemod = G9_tss$glmnet.calfit)
pred_G10<-mainpredict(betas2,mod = G10_tss$mod,calibratemod = G10_tss$glmnet.calfit)
pred_G11<-mainpredict(betas2,mod = G11_tss$mod,calibratemod = G11_tss$glmnet.calfit)
pred_G12<-mainpredict(betas2,mod = G12_tss$mod,calibratemod = G12_tss$glmnet.calfit)
pred_G13<-mainpredict(betas2,mod = G13_tss$mod,calibratemod = G13_tss$glmnet.calfit)
pred_G14<-mainpredict(betas2,mod = G14_tss$mod,calibratemod = G14_tss$glmnet.calfit)
pred_G15<-mainpredict(betas2,mod = G15_tss$mod,calibratemod = G15_tss$glmnet.calfit)
pred_G16<-mainpredict(betas2,mod = G16_tss$mod,calibratemod = G16_tss$glmnet.calfit)
pred_G17<-mainpredict(betas2,mod = G17_tss$mod,calibratemod = G17_tss$glmnet.calfit)
pred_G18<-mainpredict(betas2,mod = G18_tss$mod,calibratemod = G18_tss$glmnet.calfit)
pred_G19<-mainpredict(betas2,mod = G19_tss$mod,calibratemod = G19_tss$glmnet.calfit)
pred_G20<-mainpredict(betas2,mod = G20_tss$mod,calibratemod = G20_tss$glmnet.calfit)

rm(family_tss, G1_tss,  G2_tss,  G3_tss,  G4_tss,  G5_tss,  G6_tss,  
       G7_tss, G8_tss,  G9_tss,  G10_tss, G11_tss, G12_tss, G13_tss, 
      G14_tss, G15_tss, G16_tss, G17_tss, G18_tss, G19_tss, G20_tss);
invisible(gc());

df<-cbind(pred_G1$probs,
          pred_G2$probs,
          pred_G3$probs,
          pred_G4$probs,
          pred_G5$probs,
          pred_G6$probs,
          pred_G7$probs,
          pred_G8$probs,
          pred_G9$probs,
          pred_G10$probs,
          pred_G11$probs,
          pred_G12$probs,
          pred_G13$probs,
          pred_G14$probs,
          pred_G15$probs,
          pred_G16$probs,
          pred_G17$probs,
          pred_G18$probs,
          pred_G19$probs,
          pred_G20$probs)


df<-t(df)

DF<-as.data.frame(pred_all$probs)
kk<-as.data.frame(pred_all$pres)
row.names(kk)<-row.names(DF)
#DF$SVM<-pred_SVM$pres
kk$SVM_score<-rowMaxs(as.matrix(DF))
colnames(kk)<-c("Methylation_group_prediction","Methylation_score")

kk
ss<-row.names(kk)

datalist1<-list()
datalist2<-list()

for (i in ss) {
  
  cf<- tumor_group_table[tumor_group_table$Tumor_group==kk[i,1],]
  cf<-df[row.names(cf),]
  cf<-cf[,i,drop=FALSE ]
  rowname_max <- rownames(cf)[which(cf == max(cf),  # Extract row name of max
                                    arr.ind = TRUE)[ , 1]]
  colname_max <- colMaxs(cf)
  datalist1[i]<-rowname_max
  datalist2[i]<-colname_max
  
}

#
bf1<-do.call(rbind,datalist1)
bf2<-do.call(rbind,datalist2)
bf<-cbind(bf1,bf2)
bf<-as.data.frame(bf)
colnames(bf)<-c("Methylation_Class","Class_Score")
kk<-kk[row.names(bf),]
final_results<-cbind(kk,bf)
final_results<-final_results[row.names(week_anno),]
final_results$Class_Score<-as.numeric(final_results$Class_Score)
final_results$combi<-paste(final_results$Methylation_group_prediction,final_results$Methylation_Class,sep = "@")
final_results$combi_score<-(final_results$Methylation_score+final_results$Class_Score)/2
final_results$combi_score<-rowMeans(final_results[,c('Methylation_score', 'Class_Score')], na.rm=TRUE)
tss_results<-final_results
colnames(tss_results)<-c("super_family","super_family_score","class","class_Score","combi","combi_score")

all_df<-rbind(t(as.data.frame(all_probes_results)),
              t(as.data.frame(body_results)),
              t(as.data.frame(shelf_results)),
              t(as.data.frame(ogr_results)),
              t(as.data.frame(shore_results)),
              t(as.data.frame(opensea_results)),
              t(as.data.frame(island_results)),
              t(as.data.frame(utr5_results)),
              t(as.data.frame(ocec_results)),
              t(as.data.frame(tss_results)))

superfamily_df<-all_df[grep("super_family",row.names(all_df)),]

ll<-row.names(body_results)
datalist_1<-list()
datalist_2<-list()
datalist_3<-list()
datalist_4<-list()
datalist_5<-list()
datalist_6<-list()
for (i in ll) {
  gg<-rbind(all_probes_results[i,],body_results[i,],shelf_results[i,],ogr_results[i,],shore_results[i,],opensea_results[i,],island_results[i,],utr5_results[i,],ocec_results[i,],tss_results[i,])
  gg1<-gg[gg$combi==names(which.max(table(gg$combi))),]
  gg2<-gg[gg$super_family==names(which.max(table(gg$super_family))),]
  datalist_1[[i]]<-unique(gg2$super_family)
  datalist_2[[i]]<-round(mean(gg2$super_family_score),digits = 3)
  datalist_3[[i]]<-length(gg2$super_family)/10
  datalist_4[[i]]<-unique(gg1$class)
  datalist_5[[i]]<-round(mean(gg1$class_Score),digits = 3)
  datalist_6[[i]]<-length(gg1$class)/10
}

ss1<-do.call(rbind,datalist_1)
ss2<-do.call(rbind,datalist_2)
ss3<-do.call(rbind,datalist_3)
ss4<-do.call(rbind,datalist_4)
ss5<-do.call(rbind,datalist_5)
ss6<-do.call(rbind,datalist_6)

ss<-cbind(ss1,ss2,ss3,ss4,ss5,ss6);
ss<-as.data.frame(ss);
colnames(ss)<-c("Superfamily","Superfamily_mean_score","Superfamily_Consistency_score","Class","Class_mean_score","Class_consistency_score");


ss<-ss[row.names(week_anno),]
ss$sample_name<-week_anno$Sample;
ss<-ss[,c("sample_name","Superfamily","Superfamily_mean_score","Superfamily_Consistency_score","Class","Class_mean_score","Class_consistency_score")];
write.csv(ss,file = "/input/Bv2_classifier_output.csv");
### Sample_specific details

kk<-as.data.frame(row.names(body_results))
row.names(kk)<-kk$`row.names(body_results)`
kk$sample_name<-""
kk<-kk[row.names(week_anno),]
kk$sample_name<-week_anno$Sample
rss<-t(ss)
dd<-row.names(kk)

samplereportdir = c();
for (i in dd) {
  detail_df<-rbind(all_probes_results[i,],body_results[i,],shelf_results[i,],ogr_results[i,],shore_results[i,],opensea_results[i,],island_results[i,],utr5_results[i,],ocec_results[i,],tss_results[i,])
  vec<-c("all_probes","Gene_body","Shelf","Other_genomic_regions","Shore","OpenSea","Island","5'UTR","Open_chromatin_probes","TSS")
  detail_df$Regions<-vec
  ff<-rss[,i,drop=FALSE ]
  ff[,i]<-paste(row.names(ff),ff[,i],sep = "_")
  ww<-c(as.vector(ff[,i]),"","","")
  detail_df$overall_results<-ww
  j<-kk[i,]$sample_name
  if(j == i){
       samplereportdir[[j]]=i;
  }else{
       samplereportdir[[j]]=paste0(j,"_",i);
  };
  dir.create(paste0("/output/",samplereportdir[[j]]), showWarnings = FALSE);
  write.csv(detail_df,file = paste0("/output/",samplereportdir[[j]],"/",samplereportdir[[j]],"_cns_Bv2.csv"),row.names = FALSE);
}


########################################################################################### 
message("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n");
message("Generating HTML reports for each sample...");

for (idat in rownames(ss)) {
  i = idat;
  dna = ss[rownames(ss) == idat, "sample_name"];
  outptpath_i <- paste0("/output/", samplereportdir[[dna]]);
  dir.create(outptpath_i, showWarnings = FALSE);
  file.copy("/supplements/Methylation_header.png",     file.path(outptpath_i, "Methylation_header.png"), overwrite = TRUE);
  file.copy("/classifier/Bv2_light_htmlreport.Rmd",    file.path(outptpath_i, "Bv2_htmlreport.Rmd"), overwrite = TRUE);
  setwd(outptpath_i);
  render("Bv2_htmlreport.Rmd",   output_file = file.path(outptpath_i, paste0(dna,"_Report-CNS-Bv2_", idat, ".html")), quiet=T)
  message("\nGenerating Report for ", dna, " here:\n", file.path(outptpath_i, paste0( dna, "_Report-CNS-Bv2_", idat, ".html")), "\n");
  file.remove("Bv2_htmlreport.Rmd", "Methylation_header.png");
  write.csv( ss[i,], file = file.path(outptpath_i, "Bv2_classifier_output.csv") );
  setwd("/classifier");
};

message("\n\nSentrix: ", paste(unique(targets$Slide)), " done for Bethesda v2 classifier: ", Sys.time()); 
