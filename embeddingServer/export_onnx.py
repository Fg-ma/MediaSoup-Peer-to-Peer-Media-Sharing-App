from transformers import AutoTokenizer, AutoModel
import torch

# 1) Load
model_id = "sentence-transformers/all-MiniLM-L6-v2"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model     = AutoModel.from_pretrained(model_id).eval()

# 2) Dummy inputs for tracing
inputs = tokenizer("This is a dummy.", return_tensors="pt", padding="max_length", max_length=32)
torch.onnx.export(
    model,
    (inputs["input_ids"], inputs["attention_mask"]),
    "all-MiniLM-L6-v2.onnx",
    input_names=["input_ids","attention_mask"],
    output_names=["last_hidden_state"],
    dynamic_axes={
      "input_ids":       {0:"batch",1:"seq"},
      "attention_mask":  {0:"batch",1:"seq"},
      "last_hidden_state": {0:"batch",1:"seq"}
    },
    opset_version=14,
    do_constant_folding=True,           
)
# 3) Save tokenizer JSON
tokenizer.save_pretrained(".", legacy=False)
