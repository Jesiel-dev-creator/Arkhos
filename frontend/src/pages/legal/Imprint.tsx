export default function Imprint() {
  const pageStyle: React.CSSProperties = {
    maxWidth: "48rem",
    margin: "0 auto",
    padding: "4rem 1.5rem",
    color: "var(--muted)",
    fontFamily: "var(--font-body)",
  };

  const h1Style: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "2.25rem",
    color: "var(--frost)",
    marginBottom: "0.5rem",
  };

  const h2Style: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "1.25rem",
    color: "var(--frost)",
    marginTop: "2rem",
    marginBottom: "0.75rem",
  };

  const pStyle: React.CSSProperties = {
    lineHeight: "1.75",
    marginBottom: "1rem",
  };

  const hrStyle: React.CSSProperties = {
    borderColor: "var(--border)",
    borderTopWidth: "1px",
    margin: "2rem 0",
  };

  const subtitleStyle: React.CSSProperties = {
    color: "var(--muted)",
    fontSize: "0.875rem",
    marginBottom: "2rem",
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--frost)",
    fontWeight: 500,
  };

  return (
    <div style={pageStyle}>
      <h1 style={h1Style}>Mentions Légales</h1>
      <p style={subtitleStyle}>
        Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), les informations suivantes sont portées à la connaissance des utilisateurs du site ArkhosAI.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>Éditeur du site</h2>
      <p style={pStyle}>
        <span style={labelStyle}>Dénomination sociale :</span> Bleucommerce SAS<br />
        <span style={labelStyle}>Forme juridique :</span> Société par actions simplifiée à associé unique (SASU)<br />
        <span style={labelStyle}>Capital social :</span> 300,00 EUR<br />
        <span style={labelStyle}>SIREN :</span> 942 662 552<br />
        <span style={labelStyle}>RCS :</span> Paris<br />
        <span style={labelStyle}>Siège social :</span> 60 rue François 1er, 75008 Paris, France<br />
        <span style={labelStyle}>Contact :</span>{" "}
        <a href="mailto:contact@bleucommerce.fr" style={{ color: "var(--ember)", textDecoration: "none" }}>contact@bleucommerce.fr</a>
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>Directeur de la publication</h2>
      <p style={pStyle}>
        <span style={labelStyle}>Nom :</span> Jesiel Rombley<br />
        <span style={labelStyle}>Qualité :</span> Président de Bleucommerce SAS<br />
        <span style={labelStyle}>Contact :</span>{" "}
        <a href="mailto:contact@bleucommerce.fr" style={{ color: "var(--ember)", textDecoration: "none" }}>contact@bleucommerce.fr</a>
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>Hébergeur</h2>
      <p style={pStyle}>
        <span style={labelStyle}>Société :</span> Scaleway SAS<br />
        <span style={labelStyle}>Adresse :</span> 8 rue de la Ville l'Évêque, 75008 Paris, France<br />
        <span style={labelStyle}>Site web :</span>{" "}
        <a href="https://www.scaleway.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ember)", textDecoration: "none" }}>www.scaleway.com</a>
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>Propriété intellectuelle</h2>
      <p style={pStyle}>
        L'ensemble du contenu du site ArkhosAI (textes, graphiques, logotypes, icônes, images, clips audio et vidéo) est la propriété exclusive de Bleucommerce SAS ou fait l'objet d'une autorisation d'utilisation, et est protégé par le droit français et international de la propriété intellectuelle.
      </p>
      <p style={pStyle}>
        Le code source d'ArkhosAI est publié sous licence MIT. Les sites web générés par ArkhosAI à partir des instructions de l'utilisateur appartiennent intégralement à l'utilisateur qui en a fait la demande.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>Données personnelles</h2>
      <p style={pStyle}>
        Le traitement des données personnelles collectées via ArkhosAI est régi par notre{" "}
        <a href="/legal/privacy" style={{ color: "var(--ember)", textDecoration: "none" }}>Politique de confidentialité</a>.
        Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données personnelles.
      </p>
      <p style={pStyle}>
        Pour exercer ces droits, contactez :{" "}
        <a href="mailto:privacy@bleucommerce.fr" style={{ color: "var(--ember)", textDecoration: "none" }}>privacy@bleucommerce.fr</a>
      </p>
      <p style={pStyle}>
        Vous pouvez également adresser une réclamation à la CNIL (Commission Nationale de l'Informatique et des Libertés) :{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ember)", textDecoration: "none" }}>www.cnil.fr</a>
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>Cookies</h2>
      <p style={pStyle}>
        Informations relatives à l'utilisation des cookies sur ce site :{" "}
        <a href="/legal/cookies" style={{ color: "var(--ember)", textDecoration: "none" }}>Politique de cookies</a>.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>Droit applicable et juridiction</h2>
      <p style={pStyle}>
        Les présentes mentions légales sont régies par le droit français. Tout litige relatif à l'utilisation du site ArkhosAI est soumis à la compétence exclusive des tribunaux de Paris, sauf disposition contraire d'ordre public applicable au lieu de résidence de l'utilisateur.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>Médiation</h2>
      <p style={pStyle}>
        Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, en cas de litige non résolu avec Bleucommerce SAS, vous pouvez recourir gratuitement à un médiateur de la consommation. Nous vous communiquerons les coordonnées du médiateur compétent sur simple demande à{" "}
        <a href="mailto:contact@bleucommerce.fr" style={{ color: "var(--ember)", textDecoration: "none" }}>contact@bleucommerce.fr</a>.
      </p>
    </div>
  );
}
