import { formatProject } from "../services/formatters.js";

test("formatProject() returns true", async () => {
  const result = await formatProject(null);
  expect(result).toBe(null);
});

test("formatProject() returns true", async () => {
  const result = await formatProject("ClinicalTesting");
  expect(result).toBe("clinicaltesting");
});

test("formatProject() returns true", async () => {
  const result = await formatProject("Clinical-Testing");
  expect(result).toBe("clinicaltesting");
});

test("formatProject() returns true", async () => {
  const result = await formatProject("Clinical Testing");
  expect(result).toBe("clinicaltesting");
});

test("formatProject() returns true", async () => {
  const result = await formatProject("Clinical_testing");
  expect(result).toBe("clinicaltesting");
});

test("formatProject() returns true", async () => {
  const result = await formatProject("Clinical testing");
  expect(result).toBe("clinicaltesting");
});
