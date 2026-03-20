<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
export function InfoPage({ title, text, sections = [], actionLabel }) {
  return (
    <div style={{ padding: 20 }} className="info-page">
      <h2>{title}</h2>
      {text ? <p className="info-lead">{text}</p> : null}

      <div className="list-col mt-16">
        {sections.map((section, idx) => (
          <div className="card" key={`${section.title}-${idx}`}>
            <h3>{section.title}</h3>
            {section.text ? <p className="info-text mt-12">{section.text}</p> : null}
            {Array.isArray(section.items) && section.items.length > 0 ? (
              <ul className="info-list mt-12">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>

      {actionLabel ? <button className="btn-sos-primary mt-16">{actionLabel}</button> : null}
<<<<<<< HEAD
=======
=======
export function InfoPage({ title, text }) {
  return (
    <div style={{ padding: 20 }}>
      <h2>{title}</h2>
      <p>{text}</p>
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
    </div>
  );
}
