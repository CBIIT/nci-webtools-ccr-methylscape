import { useState } from "react";
import { Row, Col, Container, InputGroup, FormControl } from "react-bootstrap";

export default function Header() {
  const [search, setSearch] = useState("");

  function handleSearch(query) {
    if (search) window.open("https://www.google.com/search?q=site:methylscape.ccr.cancer.gov " + query, "_blank");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch(search);
  }

  return (
    <header className="flex-grow-0 bg-white">
      <include-html src="https://cbiit.github.io/nci-softwaresolutions-elements/banners/government-shutdown.html"></include-html>
      <Container fluid>
        <Row className="justify-content-between">
          <Col>
            <a href="https://ccr.cancer.gov/" target="_blank" className="h5 mb-1" rel="noreferrer">
              <img
                src="/assets/images/nci-ccr-logo.png"
                className="img-fluid my-3"
                alt="National Cancer Institute"
                style={{ height: "auto", maxWidth: "100%" }}
              />
              <span className="visually-hidden">Center for Cancer Research Methylscape Analysis</span>
            </a>
          </Col>
          <Col className="my-auto">
            <InputGroup className="ms-auto w-50">
              <FormControl
                placeholder="Documentation Search"
                aria-label="methylscape-documentation-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <InputGroup.Text onClick={() => handleSearch(search)}>
                <i className="bi bi-search" />
              </InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>
      </Container>
    </header>
  );
}
