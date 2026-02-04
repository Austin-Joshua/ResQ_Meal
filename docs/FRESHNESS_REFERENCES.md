# Freshness & Food Analysis References

ResQ Meal supports multiple optional backends for food freshness and quality assessment. This doc links to reference projects and how they are used.

## AWS Serverless GenAI Food Analyzer App

**[serverless-genai-food-analyzer-app](https://github.com/aws-samples/serverless-genai-food-analyzer-app)** — Personalized nutritional app using **Amazon Bedrock** (Claude 3 Haiku/Sonnet) and AWS CDK.

- **Relevant for ResQ Meal**: **Recipe image ingredients** — uses Claude 3 Sonnet on Bedrock with **vision** to extract food ingredients from images (`list_images_base64` → list of ingredients). System prompt: *"You have perfect vision and pay great attention to ingredients in each picture, you are very good at detecting food ingredients on images"*.
- **ResQ Meal integration**: When `AWS_REGION` (and optionally `BEDROCK_FRESHNESS_MODEL_ID`) is set, the backend can call Bedrock with the same kind of vision request to assess food freshness from a single image and return a structured assessment (classification, freshness_index). No need to deploy the full CDK stack; we use the same idea (Claude vision + prompt) inside our Node backend.
- **Full app features**: Barcode scanning (Open Food Facts), product summary (Claude Haiku), recipe generator from fridge photos (Claude Sonnet for ingredients + recipes), step-by-step recipe (streaming). Backend: Cognito, Lambda URL, DynamoDB, S3, Bedrock.

## Other Integrated Repos

- **fruit-veg-freshness-ai** (captraj) — MobileNetV2, fresh/medium_fresh/not_fresh from image.
- **Food-Freshness-Analyzer** (Parabellum768) — Environmental data (temperature, humidity, time, gas) → Fresh/Stale/Spoiled (RandomForest).
- **Freshness-Detector** (Kayuemkhan) — TensorFlow Lite, 6 items × fresh/stale.
- **Freshness_detection** (Utkarsh-Shivhare) — Roboflow YOLO for fresh/rotten produce.
- **freshvision** (devdezzies) — EfficientNetB0, apple/banana/orange fresh vs rotten.
- **Food-Image-Recognition** (MaharshSuryawala) — Inception-v3 on Food-101 (101 classes), image → food class + nutrition (protein, fat, carbs, etc.).

See `backend/.env.example` and `ml-services/*/README.md` for setup of each backend.

---

## Food classification (GitHub topic)

**[github.com/topics/food-classification](https://github.com/topics/food-classification)** — ~130 public repos tagged with food-classification. Useful for future ResQ Meal features: **food type detection** (meals vs vegetables vs baked, etc.), **nutritional info** from images, **recipe/ingredient extraction**.

### Notable repos (for potential integration)

| Repo | Stars | Description |
|------|-------|-------------|
| [stratospark/food-101-keras](https://github.com/stratospark/food-101-keras) | 715 | Food classification with Keras/TensorFlow (Food-101). |
| [Murgio/Food-Recipe-CNN](https://github.com/Murgio/Food-Recipe-CNN) | 585 | Food image → recipe with deep CNNs (VGG, Inception). |
| [openfoodfacts/openfoodfacts-python](https://github.com/openfoodfacts/openfoodfacts-python) | 423 | Open Food Facts API (barcode → ingredients, allergens, nutrition). |
| [lannguyen0910/food-recognition](https://github.com/lannguyen0910/food-recognition) | 365 | Object detection + classification + segmentation (EfficientNet, YOLOv5/v8). |
| [gabrielilharco/snap-n-eat](https://github.com/gabrielilharco/snap-n-eat) | 287 | Food detection and recommendation (PyTorch, FastAI). |
| [MaharshSuryawala/Food-Image-Recognition](https://github.com/MaharshSuryawala/Food-Image-Recognition) | 125 | Food image → nutritional facts (Inception-v3, Food-101, USDA). |

**ResQ Meal relevance**: Post-surplus flow could optionally use **food type** from a classifier (e.g. Food-101 or custom) to auto-fill `food_type`; **nutrition** from Food-Image-Recognition or Open Food Facts could enrich donation labels. Current integrations focus on **freshness**; these are candidates for **classification** and **nutrition** features.
