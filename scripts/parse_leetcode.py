import json

try:
    with open('src/data/raw_leetcode.json', 'r') as f:
        data = json.load(f)

    # Some leetcode JSONs are list of dicts or a dict with a specific key
    problems = []
    
    # Check structure
    if isinstance(data, list):
        problems = data
    elif isinstance(data, dict):
        # depending on format
        for k, v in data.items():
            if isinstance(v, list):
                problems = v
                break
                
    cleaned = []
    for idx, p in enumerate(problems[:1000]): # Limit to 1000
        # Adapt keys based on what we find. Let's just print a sample first
        pass
        
    print(f"Total entries loaded: {len(problems)}")
    if len(problems) > 0:
        print("Sample:", list(problems[0].keys()))

except Exception as e:
    print(e)
