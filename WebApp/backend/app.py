from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS module
from joblib import load
import requests
from bs4 import BeautifulSoup
import pandas as pd
from io import StringIO

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the pre-trained Logistic Regression model
selected_classifier = load('sentiment_model.joblib')
vectorizer = load('vectorizer.joblib')
scaler = load('scaler.joblib')

@app.route('/predict', methods=['POST'])
def predict_sentiment():
    data = request.json
    review = data['review']

    # Vectorize and scale the input review
    review_vectorized = vectorizer.transform([review])
    review_scaled = scaler.transform(review_vectorized)

    # Predict the probabilities using the selected classifier
    probabilities = selected_classifier.predict_proba(review_scaled)

    # Calculate the percentage of positivity and negativity
    positivity_percentage = probabilities[0][1] * 100
    negativity_percentage = probabilities[0][0] * 100

    # Determine sentiment based on positivity_percentage and negativity_percentage
    sentiment = 'Positive' if positivity_percentage > negativity_percentage else 'Negative'

    return jsonify({
        'sentiment': sentiment,
        'positivity_percentage': positivity_percentage,
        'negativity_percentage': negativity_percentage
    })

def scrape_imdb_reviews(review_input):
    try:
        if review_input.startswith('http'):
            # If the input is a URL, fetch the HTML content
            response = requests.get(review_input)
            response.raise_for_status()  # Raise an exception for unsuccessful HTTP requests
            review_html = response.text
        else:
            # If the input is raw HTML content, use it directly
            review_html = review_input


        soup = BeautifulSoup(review_html, 'html.parser')

        reviews = []

        for review_container in soup.select('.lister-item.mode-detail.imdb-user-review'):
            rating_element = review_container.select_one('.ipl-ratings-bar .rating-other-user-rating span')
            rating = rating_element.get_text(strip=True) if rating_element else None

            username_element = review_container.select_one('.display-name-link a')
            username = username_element.get_text(strip=True) if username_element else None

            review_date_element = review_container.select_one('.display-name-date .review-date')
            review_date = review_date_element.get_text(strip=True) if review_date_element else None

            review_text_element = review_container.select_one('.content .text')
            review_text = review_text_element.get_text(strip=True) if review_text_element else None

            reviews.append({
                'rating': rating,
                'username': username,
                'review_date': review_date,
                'review_text': review_text,
            })

        print("Extracted reviews:", reviews)

        return reviews
    except Exception as e:
        print("Error:", str(e))
        return {'error': str(e)}


@app.route('/scrape_imdb_review', methods=['POST'])
def handle_scrape_imdb_review():
    try:
        data = request.get_json()
        review_input = data.get('review_html', '')
        
        scraped_data = scrape_imdb_reviews(review_input)

        print("Scraped data:", scraped_data)

        return jsonify(scraped_data)
    except Exception as e:
        print("Error in API:", str(e))
        return jsonify({'error': str(e)})

@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    try:
        file = request.files['file']
        csv_data = pd.read_csv(file)
        
        # Keep only the first 100 records
        csv_data = csv_data.head(100)

        columns = csv_data.columns.tolist()
        rows = csv_data.to_dict(orient='records')

        return jsonify({'columns': columns, 'rows': rows})
    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run(port=5000)
