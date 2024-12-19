from apify_client import ApifyClient
import pandas as pd
import re
import emoji
import torch
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification

app = Flask(__name__)
CORS(app)

def get_scraped_data(client, topics, resultsLimit = 20):
    # Prepare the Actor input
    run_input = {
        "hashtags": topics,
        "resultsLimit": resultsLimit,
        "onlyPostsWithHashtagIn": "hashtags-or-text", # "hashtags" another option
    }
    
    # Run the Actor and wait for it to finish
    run = client.actor("reGe1ST3OBgYZSsZJ").call(run_input=run_input)

    # Fetch and print Actor results from the run's dataset (if there are any)
    dataset = []
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        dataset.append(item)

    df = pd.DataFrame(dataset)

    return df


# Function to clean each caption
def clean_caption(text):
    # Remove hashtags and mentions
    text = re.sub(r'@\w+', '', text)

    # Convert hashtags to plain text (remove '#' but keep words)
    text = re.sub(r'#', '', text)
    
    # Remove URLs
    text = re.sub(r'http\S+|www.\S+', '', text)
    
    # Convert emojis to text (optional)
    text = emoji.demojize(text)
    
    # Remove special characters and extra whitespace
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Convert to lowercase
    text = text.lower()
    
    return text

def sentiment_scores(data):
    tokenizer = AutoTokenizer.from_pretrained("finiteautomata/bertweet-base-sentiment-analysis")
    model = AutoModelForSequenceClassification.from_pretrained("finiteautomata/bertweet-base-sentiment-analysis")

    processed_texts = list(data['clean_caption'])

    # Tokenize and prepare inputs for the model
    inputs = tokenizer(processed_texts, padding=True, truncation=True, return_tensors="pt")

    # Get predictions
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits

    # Convert logits to probabilities and labels
    probabilities = torch.softmax(logits, dim=1).numpy()
    predicted_labels = np.argmax(probabilities, axis=1)

    # Map labels to sentiment names (this model likely uses [0: Negative, 1: Neutral, 2: Positive])
    label_map = {0: "Negative", 1: "Neutral", 2: "Positive"}
    predicted_sentiments = [label_map[label] for label in predicted_labels]

    # Display results
    results = pd.DataFrame({
        "Processed Caption": processed_texts,
        "Original Caption" : data["caption"],
        "likes" : data["likesCount"],
        "Predicted Sentiment": predicted_sentiments,
        "Probabilities": probabilities.tolist()
    })

    return results


@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    data = request.get_json()
    hashtags = data.get("caption", "")

    # Initialize the ApifyClient with your API token
    client = ApifyClient("apify_api_7urw8C3j2bxjOaZCfsZncrJur37Mpl2Ahyzt")
    topics = hashtags.split()

    resultsLimit = 20
    scraped_data = get_scraped_data(client, topics, resultsLimit = 20)
    
    # Apply the cleaning function
    scraped_data['clean_caption'] = scraped_data['caption'].apply(clean_caption)

    df_results = sentiment_scores(scraped_data)

    results = dict(df_results["Predicted Sentiment"].value_counts())

    
    for senti in results.keys():
        results[senti] = np.round((results[senti]*100)/resultsLimit, 2)

    # Find top 5 captions by likes for each sentiment
    top_captions = {}
    for sentiment in ["Negative", "Neutral", "Positive"]:
        # Filter by sentiment and sort by likes in descending order
        sentiment_df = df_results[df_results["Predicted Sentiment"] == sentiment]
        sorted_by_likes = sentiment_df.sort_values(by="likes", ascending=False)
        top_captions[sentiment] = sorted_by_likes["Original Caption"].head(5).to_list()

    # Print and return combined results
    response = {
        "sentiment_percentages": results,
        "top_captions": top_captions
    }

    # print(type(results))
    print(response)

    # Return sentiment result as JSON
    return jsonify(response)

if __name__ == '__main__':
    app.run(port=5000, debug=True)