use axum::{
    extract::Extension, http::StatusCode, response::IntoResponse, routing::post, Json, Router,
};
use ndarray::Array2;
use ort::{
    environment::Environment, session::Session, tensor::OrtOwnedTensor, ExecutionProvider, Value,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{net::SocketAddr, sync::Arc};
use tokenizers::Tokenizer;

#[derive(Deserialize)]
struct Payload {
    input: Vec<String>,
}

#[derive(Serialize)]
struct Embedding {
    embedding: Vec<f32>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // 1) Build the ONNX Runtime environment with CPU execution provider
    let builder = Environment::builder().with_name("embed_service");
    let env = Arc::new(
        builder
            .with_execution_providers([ExecutionProvider::CPU(Default::default())])
            .build()?,
    );

    // 2) Create the Session from the ONNX model
    let session =
        Arc::new(ort::SessionBuilder::new(&env)?.with_model_from_file("all-MiniLM-L6-v2.onnx")?);

    // 3) Load the tokenizer
    let tokenizer =
        Arc::new(Tokenizer::from_file("tokenizer.json").map_err(|e| anyhow::anyhow!(e))?);

    // 4) Build the Axum router
    let app = Router::new()
        .route("/embed", post(embed))
        .layer(Extension(session))
        .layer(Extension(tokenizer));

    // 5) Run the server
    let addr = SocketAddr::from(([0, 0, 0, 0], 7400));
    println!("Listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}

async fn embed(
    Extension(session): Extension<Arc<Session>>,
    Extension(tokenizer): Extension<Arc<Tokenizer>>,
    Json(payload): Json<Payload>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let texts = payload.input.clone();

    let embeddings: Vec<Embedding> = tokio::task::spawn_blocking(move || {
        let encs = tokenizer.encode_batch(texts, true).map_err(|e| {
            (
                StatusCode::BAD_REQUEST,
                format!("Tokenization error: {}", e),
            )
        })?;
        let batch = encs.len();
        let max_len = encs.iter().map(|e| e.get_ids().len()).max().unwrap_or(0);

        let mut ids = Array2::<i64>::zeros((batch, max_len));
        let mut mask = Array2::<i64>::zeros((batch, max_len));
        for (i, e) in encs.iter().enumerate() {
            for (j, &id) in e.get_ids().iter().enumerate() {
                ids[(i, j)] = id as i64;
                mask[(i, j)] = e.get_attention_mask()[j] as i64;
            }
        }

        let allocator = session.allocator();

        // Clone mask before consuming it
        let mask_clone = mask.clone();

        let ids_dyn = ids.into_dyn();
        let ids_tensor = ids_dyn.into();

        let mask_dyn = mask_clone.into_dyn();
        let mask_tensor = mask_dyn.into();

        let ids_value = Value::from_array(allocator, &ids_tensor).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error creating input tensor: {}", e),
            )
        })?;

        let mask_value = Value::from_array(allocator, &mask_tensor).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error creating attention mask tensor: {}", e),
            )
        })?;

        let outputs: Vec<Value> = session.run(vec![ids_value, mask_value]).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error running the model: {}", e),
            )
        })?;

        let tensor: OrtOwnedTensor<f32, _> = outputs[0].try_extract().map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error extracting output tensor: {}", e),
            )
        })?;

        let view = tensor.view();
        let shape = view.shape(); // [batch, seq_len, dim]
        let (b, s, d) = (shape[0], shape[1], shape[2]);
        let mut result = Vec::with_capacity(b);

        // Use original mask (not moved)
        for i in 0..b {
            let mut sum = vec![0f32; d];
            let mut count = 0;
            for j in 0..s {
                if mask[(i, j)] > 0 {
                    for k in 0..d {
                        sum[k] += view[[i, j, k]];
                    }
                    count += 1;
                }
            }
            for v in &mut sum {
                *v /= count as f32;
            }
            result.push(Embedding { embedding: sum });
        }

        Ok(result)
    })
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))??;

    let body = json!({ "data": embeddings });
    Ok((StatusCode::OK, Json(body)))
}
