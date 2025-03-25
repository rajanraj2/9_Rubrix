from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Define the ideal solution (previous high-standard solution) and the user's solution
ideal_solution = """
To improve pedestrian safety at FOBs, an ideal solution must integrate **infrastructure enhancements, AI-driven analytics, behavioral incentives, and awareness campaigns**. 

1. **Infrastructure Improvements:**
   - Install **ramps, elevators, and wider staircases** for universal access.
   - Improve **lighting, cleanliness, and weatherproofing**.
   - Add **barriers and deterrents** to prevent jaywalking.

2. **AI & Technology-Driven Enhancements:**
   - Deploy **computer vision-based monitoring** to track pedestrian behavior.
   - Use **heatmaps** to analyze FOB usage patterns and optimize placement.
   - Implement **smart LED indicators** that guide pedestrians to the nearest FOB.

3. **Behavioral Incentives & Engagement:**
   - Introduce **gamification** like interactive floor games and quizzes.
   - Offer **reward points** for consistent FOB usage, redeemable for small incentives.
   - Use **psychological nudges** such as **countdown timers** and **persuasive signage**.

4. **Awareness & Community Engagement:**
   - Conduct **nationwide digital campaigns** with social media influencers.
   - Organize **on-ground events and workshops** to educate the public.
   - Use **VR-based training simulations** in schools to instill safe habits early.

5. **Data-Driven Policy & Maintenance:**
   - AI-based **predictive maintenance** to ensure FOBs remain in good condition.
   - **Crowdsourced feedback mechanisms** to continuously improve designs.
   - Collaborate with **urban planners and policymakers** to implement long-term pedestrian safety reforms.

By **combining engineering, AI, behavioral psychology, and community-driven initiatives**, this solution ensures high **usability, accessibility, and safety** for all pedestrians.
"""

user_solution = """
Title of Solution: Enhancing Pedestrian Safety Through Inclusive, Engaging, and AI-driven FOB Solutions

Problem Identification:
1. Lack of inclusivity in FOBs (no ramps/elevators for elderly/disabled).
2. Poor visibility and accessibility (lack of bright colors/signage).
3. Lack of awareness and poor enforcement of jaywalking penalties.
4. Low engagement due to uninspiring FOB designs.
5. Unauthorized vehicle use due to inadequate barriers.

Solution Approach:
1. **Inclusive FOB Design:**
   - Add **ramps, elevators, and sitting areas**.
   - Design **separate sections for different user groups**.

2. **Visual and Psychological Engagement:**
   - **Bright colors and monthly graffiti** to increase visibility.
   - **Interactive floor games and safety awareness posters**.

3. **AI/ML-Driven Insights:**
   - Use **CCTV to analyze pedestrian behavior** and optimize FOB usage.
   - Identify **hotspots for jaywalking and targeted interventions**.

4. **Awareness Campaigns:**
   - **Social media challenges** and **collaborations with influencers**.
   - **Street plays and community outreach programs**.

5. **Infrastructure Maintenance & Enforcement:**
   - Weekly **inspections for cleanliness and safety**.
   - **AI-based tracking** of violations to improve compliance.

Challenges & Feasibility:
1. **Technical constraints:** AI deployment requires **data collection & partnerships**.
2. **User resistance:** Awareness campaigns and engagement strategies can help.
3. **Funding:** **CSR and government grants** can support implementation.
4. **Sustainability:** Dedicated **maintenance teams** will ensure longevity.

Impact & Future Vision:
- Short-term: **Increased safety awareness and FOB usage**.
- Long-term: **Cultural shift towards safer habits and data-driven decision-making**.
"""

# Compute cosine similarity
vectorizer = TfidfVectorizer().fit_transform([ideal_solution, user_solution])
similarity_score = cosine_similarity(vectorizer[0], vectorizer[1])[0][0] * 100  # Convert to percentage

# Define scoring criteria (0-100 scale)
scoring_criteria = {
    "Technical Depth": 85,  # Good use of AI/ML, but lacks real-time incentives
    "Feasibility": 90,  # Practical approach with funding considerations
    "Innovation": 80,  # Some novel ideas but lacks gamification incentives
    "Impact Potential": 88,  # Strong short-term and long-term effects
    "Completeness": 85,  # Covers key areas but could use more predictive tech
}

# Calculate the average score
average_score = sum(scoring_criteria.values()) / len(scoring_criteria)

# Output results
similarity_score, scoring_criteria, average_score
