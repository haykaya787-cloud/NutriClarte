document.addEventListener("DOMContentLoaded", function () {
  const btnEvaluate = document.getElementById("btnEvaluate");
  
  if (btnEvaluate) {
    btnEvaluate.addEventListener("click", function () {
      const productName = document.getElementById("productName").value || "Product";
      const sodiumVal = parseFloat(document.getElementById("sodiumInput").value) || 0;
      const addedSugar = parseFloat(document.getElementById("addedSugar").value) || 0;
      const satFat = parseFloat(document.getElementById("satFat").value) || 0;
      
      // Calculate dynamic scores based on parameters
      let sugarScore = Math.max(0, Math.min(100, Math.round(100 - (addedSugar * 2.5))));
      let fatScore = Math.max(0, Math.min(100, Math.round(100 - (satFat * 6.5))));
      let sodiumScore = Math.max(0, Math.min(100, Math.round(100 - (sodiumVal / 8))));
      
      // Calculate generalized main score
      let overallScore = Math.round((sugarScore * 0.35) + (fatScore * 0.35) + (sodiumScore * 0.30));
      
      const lang = document.documentElement.lang || "en";
      
      // Default English strings
      let titleText = "Use sometimes";
      let summaryText = "Sodium is the main concern.";
      let fitText = "Great fit";
      let limitText = "Limit";
      let rec1Title = "Reduce sodium exposure";
      let rec1Desc = "This product exceeds optimal levels for your cardiovascular profile.";
      let rec2Title = "Suggested alternatives";
      let rec2Desc = "Organic low-sodium alternatives or homemade varieties.";
      
      if (lang === "fr") {
        titleText = "À consommer parfois";
        summaryText = "Le sodium est le problème majeur.";
        fitText = "Idéal";
        limitText = "À limiter";
        rec1Title = "Réduire l'apport en sodium";
        rec1Desc = "Ce produit dépasse les niveaux optimaux recommandés pour votre profil.";
        rec2Title = "Alternatives suggérées";
        rec2Desc = "Soupes de légumes sans sel ajouté ou faites maison.";
      } else if (lang === "es") {
        titleText = "Uso ocasional";
        summaryText = "El sodio es el problema principal.";
        fitText = "Ideal";
        limitText = "Limitar";
        rec1Title = "Reducir ingesta de sodio";
        rec1Desc = "Este producto supera los niveles óptimos para su salud cardiovascular.";
        rec2Title = "Alternativas sugeridas";
        rec2Desc = "Variantes bajas en sal o preparaciones frescas.";
      }

      // Dynamic adjustments based on worst scoring metric
      let ringColor = "#c2410c"; 
      if (overallScore >= 75) {
        ringColor = "#166534"; 
        if (lang === "en") titleText = "Excellent choice";
        if (lang === "fr") titleText = "Excellent choix";
        if (lang === "es") titleText = "Excelente opción";
        summaryText = lang === "fr" ? "Parfaitement équilibré." : (lang === "es" ? "Perfectamente equilibrado." : "Perfectly balanced.");
      } else if (overallScore < 45) {
        ringColor = "#b91c1c"; 
        if (lang === "en") titleText = "Limit consumption";
        if (lang === "fr") titleText = "À limiter fortement";
        if (lang === "es") titleText = "Limitar consumo";
      }

      if (sodiumVal > 500 && sodiumScore < sugarScore && sodiumScore < fatScore) {
        summaryText = lang === "fr" ? "Le sodium est le problème majeur." : (lang === "es" ? "El sodio es el problema principal." : "Sodium is the main concern.");
      } else if (addedSugar > 15 && sugarScore < fatScore) {
        summaryText = lang === "fr" ? "La teneur en sucre est élevée." : (lang === "es" ? "El nivel de azúcar es elevado." : "Sugar content is the main concern.");
      } else if (satFat > 5) {
        summaryText = lang === "fr" ? "Les graisses saturées sont élevées." : (lang === "es" ? "Las grasas saturadas son elevadas." : "Saturated fat is the main concern.");
      }

      const overallRing = document.getElementById("overallRing");
      const overallScoreSpan = document.getElementById("overallScore");
      if (overallRing) {
        overallRing.style.setProperty("--score", overallScore);
        overallRing.style.setProperty("--ring-color", ringColor);
      }
      if (overallScoreSpan) overallScoreSpan.textContent = overallScore;
      document.getElementById("resultTitle").textContent = `${titleText} — ${productName}`;
      document.getElementById("resultSummary").textContent = summaryText;

      const badgesContainer = document.getElementById("ingredientBadges");
      if (badgesContainer) {
        badgesContainer.innerHTML = `
          <span class="ing-badge ${sodiumScore < 50 ? 'danger' : 'success'}">${lang === 'fr' ? 'Sodium' : (lang === 'es' ? 'Sodio' : 'Sodium')}</span>
          <span class="ing-badge ${sugarScore < 50 ? 'danger' : 'success'}">${lang === 'fr' ? 'Sucre ajouté' : (lang === 'es' ? 'Azúcar' : 'Added sugar')}</span>
          <span class="ing-badge ${fatScore < 50 ? 'danger' : 'success'}">${lang === 'fr' ? 'Gras saturé' : (lang === 'es' ? 'Grasa sat.' : 'Sat fat')}</span>
        `;
      }

      const gridContainer = document.getElementById("conditionScores");
      if (gridContainer) {
        gridContainer.innerHTML = `
          <div class="condition-card">
            <h4>${lang === 'fr' ? 'Diabète' : 'Diabetes'}</h4>
            <div>
              <div class="condition-score-value">${sugarScore}/100</div>
              <div class="condition-status ${sugarScore >= 50 ? 'status-great' : 'status-limit'}">${sugarScore >= 50 ? fitText : limitText}</div>
            </div>
          </div>
          <div class="condition-card">
            <h4>${lang === 'fr' ? 'Cholestérol' : 'Cholesterol'}</h4>
            <div>
              <div class="condition-score-value">${fatScore}/100</div>
              <div class="condition-status ${fatScore >= 50 ? 'status-great' : 'status-limit'}">${fatScore >= 50 ? fitText : limitText}</div>
            </div>
          </div>
          <div class="condition-card">
            <h4>${lang === 'fr' ? 'Hypertension' : (lang === 'es' ? 'Presión arterial' : 'Blood pressure')}</h4>
            <div>
              <div class="condition-score-value">${sodiumScore}/100</div>
              <div class="condition-status ${sodiumScore >= 50 ? 'status-great' : 'status-limit'}">${sodiumScore >= 50 ? fitText : limitText}</div>
            </div>
          </div>
        `;
      }

      const recBlock = document.getElementById("recommendationsBlock");
      if (recBlock) {
        recBlock.innerHTML = `
          <div class="rec-card">
            <h5>${sodiumScore < 50 ? rec1Title : (lang === 'fr' ? 'Profil stable' : (lang === 'es' ? 'Perfil estable' : 'Balanced profile'))}</h5>
            <p>${sodiumScore < 50 ? rec1Desc : (lang === 'fr' ? 'L\'apport convient à vos critères.' : (lang === 'es' ? 'El aporte es apto para sus criterios.' : 'The intake suits your parameters.'))}</p>
          </div>
          <div class="rec-card">
            <h5>${rec2Title}</h5>
            <p>${rec2Desc}</p>
          </div>
        `;
      }
    });
  }
});
