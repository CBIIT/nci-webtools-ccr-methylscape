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