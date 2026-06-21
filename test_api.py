import requests

url = "http://127.0.0.1:5000/predict"

print("🩺 Medical AI Test Terminal\n")

while True:
    text = input("Enter symptoms: ")

    if text.lower() == "exit":
        break

    response = requests.post(url, json={"symptoms": text})
    data = response.json()

    print("\n🔍 Prediction:", data["prediction"])

    print("\n📊 Top 3:")
    for item in data["top_3"]:
        print(f"- {item['disease']} : {item['confidence']:.4f}")

    print("-" * 40)