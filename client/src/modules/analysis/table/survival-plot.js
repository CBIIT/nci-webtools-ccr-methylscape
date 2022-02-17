import { useRecoilValue } from 'recoil';
import Plot from 'react-plotly.js';
import ReactTable from '../../components/table';
import { survivalDataSelector } from './table.state';
import { getSurvivalPlot } from './survival-plot.utils';

export default function SurvivalPlot() {
  const survivalData = useRecoilValue(survivalDataSelector);
  const survivalPlot = getSurvivalPlot(survivalData?.data);
  const summaryTableColumns = ['time', 'n.risk', 'strata'].map((e) => ({
    id: e,
    accessor: (row) => row[e],
    Header: e,
  }));

  return (
    <>
      <Plot {...survivalPlot} className="w-100" useResizeHandler />
      {survivalData?.pValue && (
        <div>
          <strong>p value: </strong>
          {survivalData.pValue[0].pval}
        </div>
      )}
      <ReactTable
        data={survivalData?.summary || []}
        columns={summaryTableColumns}
      />
    </>
  );
}
