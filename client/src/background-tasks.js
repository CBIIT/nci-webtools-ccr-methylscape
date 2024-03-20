import { useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { taskQueueState } from "./background-tasks.state";
import { submissionFormState } from "./modules/submissions/submissions.state";
import axios from "axios";

export default function TaskQueue() {
  const [state, setState] = useRecoilState(taskQueueState);
  const setFormState = useSetRecoilState(submissionFormState);
  const updateForm = (update) => setFormState((state) => ({ ...state, ...update }));
  const queue = state.queue?.slice();

  useEffect(() => {
    if (queue.length) {
      const job = queue.shift();
      setState({ queue });
      tasks[job.task](job.params).catch(console.error);
    }
  }, [queue]);

  async function submission(params) {
    const { submitData, uploadFiles } = params;
    const { uuid } = submitData.submission;
    try {
      updateForm({ status: "IN_PROGRESS" });
      const response = await axios.post(`/api/submissions/${uuid}`, submitData);
      const { submissionsId } = response.data;

      // do not upload files in parallel (minimize memory usage & time per upload)
      let filesUploaded = 0;
      for (const file of uploadFiles) {
        const fileData = new FormData();
        fileData.append("sampleFiles", file);
        fileData.append("submissionsId", submissionsId);
        await axios.post(`/api/submissions/${uuid}`, fileData);
        filesUploaded++;
        updateForm({
          progress: Math.round((filesUploaded * 100) / uploadFiles.length),
          progressLabel: `Uploaded ${filesUploaded} of ${uploadFiles.length} files`,
        });
      }
      // execute classifier
      await axios.get(`/api/submissions/run-classifier/${submissionsId}`);
      updateForm({ status: "COMPLETED" });
    } catch (error) {
      console.log(error);
      if (error?.response?.data) {
        updateForm({ error: JSON.stringify(error.response.data, undefined, 2), status: "" });
      } else if (error?.message) {
        updateForm({ error: error.message, status: "" });
      } else {
        updateForm({ error: "Unknown error", status: "" });
      }
    }
  }

  const tasks = { submission };

  return <></>;
}
