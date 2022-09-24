import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useRecoilState, useRecoilValue } from "recoil";
import { formState, geneOptionsSelector, preFormState } from "./copy-number.state";
import MultiSearch from "../../components/multi-search";

export default function CopyNumberForm() {
  const [form, setForm] = useRecoilState(formState);
  const [preForm] = useRecoilState(preFormState);
  const geneOptions = useRecoilValue(geneOptionsSelector);
  const mergeForm = (state) => setForm({ ...form, ...state });

  function handleSearch(e) {
    mergeForm({ search: e });
  }

  function handleAnnotations() {
    setForm({ ...form, annotations: !form.annotations });
  }

  function filterGenes(inputValue = "", limit = 100) {
    return geneOptions
      .filter((g) => !inputValue || g.label.toLowerCase().startsWith(inputValue.toLowerCase()))
      .slice(0, limit);
  }

  async function handleSearchGene(inputValue) {
    return filterGenes(inputValue, 40);
  }

  return (
    <Row>
      {/* <Col sm="auto" className="d-flex">
        <Form.Group controlId="plotSignificant" className="my-auto">
          <Form.Check
            label="Significant"
            type="switch"
            name="plotSignificant"
            checked={preForm.significant}
            onChange={handleSignificant}
          />
        </Form.Group>
      </Col> */}
      <Col sm="auto" className="d-flex">
        <Form.Group controlId="toggleAnnotations" className="my-auto">
          <Form.Check
            label="Annotations"
            type="switch"
            name="toggleAnnotations"
            checked={form.annotations}
            onChange={handleAnnotations}
            disabled={!preForm.significant}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group id="copy-number-search" className="mb-3">
          <Form.Label>Search</Form.Label>
          <MultiSearch
            name="copy-number-search"
            placeholder="Gene(s)"
            value={form.search}
            defaultOptions={filterGenes()}
            loadOptions={handleSearchGene}
            onChange={handleSearch}
          />
        </Form.Group>
      </Col>
    </Row>
  );
}
