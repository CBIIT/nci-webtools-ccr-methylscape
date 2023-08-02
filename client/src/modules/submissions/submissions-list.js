import { Card, Button } from "react-bootstrap";
import Table from "../components/table";

export default function SubmissionsList({ submissions }) {
  const columns = [
    { id: "1", accessor: "1", Header: "Submission Name" },
    { id: "2", accessor: "2", Header: "Submitter" },
    { id: "2", accessor: "2", Header: "Organization" },
    { id: "2", accessor: "2", Header: "Sample Count" },
    { id: "2", accessor: "2", Header: "Status" },
    { id: "2", accessor: "2", Header: "Submitted Date" },
    { id: "2", accessor: "2", Header: "Action", Cell: ({ cell }) => <Button type="link">action</Button> },
  ];

  return (
    <Card className="bg-white p-3">
      {submissions.length == 0 ? (
        <p>You have no submissions. Click on Create Submission to start a data submission.</p>
      ) : (
        <div>placeholder</div>
        // <Table name="" data={[]} columns={[]} options={{}} />
      )}
    </Card>
  );
}
