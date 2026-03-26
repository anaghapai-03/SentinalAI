import axios from "axios";

export async function getRisk(features) {
  const res = await axios.post("http://127.0.0.1:5000/predict", features);
  return res.data.risk;
}