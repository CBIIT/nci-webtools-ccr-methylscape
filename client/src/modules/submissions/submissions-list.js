import { Card, Button } from "react-bootstrap";
import Table from "../components/table";

export default function SubmissionsList({ submissions }) {
  const columns = [
    { accessor: "submissionName", Header: "Submission Name" },
    { accessor: "submitter", Header: "Submitter" },
    { accessor: "organization", Header: "Organization" },
    {
      accessor: "samples",
      Header: "Sample Count",
      Cell: ({ value }) => value.length,
    },
    { accessor: "status", Header: "Status" },
    { accessor: "submitDate", Header: "Submitted Date" },
    { Header: "Action", Cell: (e) => <Button type="link">action</Button> },
  ];

  const data = [
    // {
    //   submissionName: "subName",
    //   submitter: "name",
    //   organization: "org",
    //   samples: [{}],
    //   status: "status",
    //   submitDate: "123",
    // },
  ];

  return (
    <Card className="bg-white p-3">
      {submissions.length == 0 ? (
        <p>You have no submissions. Click on Create Submission to start a data submission.</p>
      ) : (
        <Table key="submissions-table" name="Submissions" data={data} columns={columns} />
      )}
    </Card>
  );
}
