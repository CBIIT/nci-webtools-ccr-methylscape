import { useRecoilState, useRecoilValue } from "recoil";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import MultiSearch from "../../components/multi-search";
import { formState } from "./metadata-plot.state";
import colorOptions from "./color-options.json";
import { sessionState } from "../../session/session.state";

export default function MetadataForm({ className, onSelect }) {
  const [form, setForm] = useRecoilState(formState);
  const mergeForm = (state) => setForm({ ...form, ...state });
  const session = useRecoilValue(sessionState);

  function handleChange(event) {
    let { name, value, checked, type } = event.target;
    if (type === "checkbox") {
      value = checked;
    }
    mergeForm({ [name]: value });
  }

  function handleSearch(e) {
    mergeForm({ search: e });
  }

  return (
    <Form className={className}>
      <Row>
        <Col md="auto">
          <Form.Group id="organSystem" className="form-group mb-3">
            <Form.Label>Organ System</Form.Label>
            <Form.Select name="organSystem" value={form.organSystem} onChange={handleChange} className="source">
              {session?.user.organizationOrganSystem.length ? (
                session.user.organizationOrganSystem.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))
              ) : (
                <option value="centralNervousSystem">Central Nervous System</option>
              )}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md="auto">
          <Form.Group id="embedding" className="mb-3">
            <Form.Label>Embedding</Form.Label>
            <Form.Select name="embedding" value={form.embedding} onChange={handleChange}>
              <option>umap</option>
              <option>densmap</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group id="color" className="mb-3">
            <Form.Label>Color By</Form.Label>
            <Form.Select name="color" value={form.color} onChange={handleChange}>
              {colorOptions.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md="3">
          <Form.Group id="search" className="mb-3">
            <Form.Label>Search</Form.Label>
            <MultiSearch name="search" placeholder="Sample" value={form.search} onChange={handleSearch} />
          </Form.Group>
        </Col>
        <Col md="auto">
          <Form.Group controlId="showAnnotations" className="mb-3">
            <Form.Check
              label="Label Most Recent Samples"
              type="switch"
              name="showAnnotations"
              checked={form.showAnnotations}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
}
