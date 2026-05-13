from backend.summariser import summarize_text,generate_summary

content = """
 Manipur moves toward resettlement of displaced persons: Panel assesses community assets’ plan
Content:  Manipur Chief Minister Yumnam Khemchand Singh (centre) has said that his government’s biggest priority is expediting the rehabilitation and resettlement process of people displaced by the ethnic conflict in the state. (File photo) In a key step towards rehabilitating internally displaced persons (IDPs) in Manipur, the Standing Finance Committee (SFC) convened last month to appraise a proposal from the state government for creating community assets in resettled villages and habitations. The SFC is a high-level administrative body, often reconstituted within ministries or autonomous institutions to evaluate, approve, or recommend financial projects and expenditures. The meeting, held on March 24, comes weeks after a special session of the Security Related Expenditure) Standing Committee, on March 5, chaired by the special secretary (internal security), deliberated claims submitted by the Manipur government. Officials familiar with the discussions said the SFC scrutiny focuses on funding and implementation details for infrastructure like schools, health centres, toilets, and water facilities in areas hosting thousands of IDPs displaced by violence since May 2023. “A meeting of SFC for appraisal of the proposal of the Manipur government regarding creation of community assets in resettled villages/habitations of IDPs in Manipur was held,” a senior government official said."""

sum = summarize_text(content)

print(sum)

print(generate_summary(sum))
