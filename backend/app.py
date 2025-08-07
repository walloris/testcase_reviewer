from flask import Flask, request, jsonify
from gigachat import (
    review_test_case_by_gigachat,
    load_prompt_template,
    get_rules_and_recommendations,
)

app = Flask(__name__)


@app.route("/api/review", methods=["POST"])
def review():
    data = request.get_json()
    token = data.get("token", "")
    test_case = data.get("test_case", {})

    rules = get_rules_and_recommendations()
    prompt_template = load_prompt_template()
    prompt = prompt_template.format(
        rules=rules["rules"],
        recomendations=rules["recommendations"],
        **test_case,
    )

    result = review_test_case_by_gigachat(prompt, token)
    return jsonify(result or {"error": "Gigachat call failed"})


if __name__ == "__main__":
    app.run(debug=True)
