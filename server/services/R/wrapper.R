# call functions given fn name and capture console output
wrapper <- function(fn, args, paths) {
  stdout <- vector('character')
  con <- textConnection('stdout', 'wr', local = TRUE)
  sink(con, type = "message")
  sink(con, type = "output")

  output = list()

  tryCatch({
    output = get(fn)(args, paths)
  }, error = function(e) {
    output <<- append(output, list(uncaughtError = paste0(deparse(e$call), ': ', e$message)))
  }, finally = {
    sink(con)
    sink(con)
    return(jsonlite::toJSON(list(stdout = stdout, output = output), pretty = TRUE, auto_unbox = TRUE))
  })
}

getSurvivalData <- function(data) {
    survivalFormula <- survival::Surv(overallSurvivalMonths, overallSurvivalStatus) ~ group
    survivalCurves <- survminer::surv_fit(survivalFormula, data = data)
    survivalDataTable <- survminer::surv_summary(survivalCurves, data)

    # create survival summary table for n.risk at each time point
    survivalSummaryTimes <- survminer:::.get_default_breaks(survivalCurves$time)
    survivalSummary <- summary(survivalCurves, times = survivalSummaryTimes, extend = T)
    survivalSummaryTable <- tibble::tibble(
      time = survivalSummary$time,
      n.risk = survivalSummary$n.risk,
      strata = survivalSummary$strata
    )

    # widen summary table across all strata
    if (!is.null(survivalSummaryTable$strata)) {
      survivalSummaryTable <- tidyr::pivot_wider(
        survivalSummaryTable, 
        names_from = "strata", 
        values_from="n.risk"
      )
    }

    pValue <- survminer::surv_pvalue(survivalCurves)

    list(
        data = survivalDataTable, 
        summary = survivalSummaryTable, 
        pValue = pValue
    )
}