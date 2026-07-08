document.addEventListener("DOMContentLoaded", function () {
  const btnEvaluate = document.getElementById("btnEvaluate");
  
  if (btnEvaluate) {
    btnEvaluate.addEventListener("click", function () {
      // Extraction des entrées du formulaire de simulation
      const addedSugar = parseFloat(document.getElementById("addedSugar").value) || 0;
      const satFat = parseFloat(document.getElementById("satFat").value) || 0;
      
      let score = 100;
      
      // Algorithme de test nutritionnel de démonstration
      score -= (addedSugar * 1.2);
      score -= (satFat * 1.5);
      
      // Encapsulation entre 0 et 100
      score = Math.max(0, Math.min(100, Math.round(score)));
      
      // Attribution dynamique des variables visuelles
      let ringColor = "#10b981"; // Vert par défaut (Bon)
      let title = "Excellent choice";
      let summary = "This product matches health goals well.";
      
      const lang = document.documentElement.lang || "en";
      
      if (score < 40) {
        ringColor = "#b91c1c"; // Rouge
        if (lang === "fr") {
          title = "À éviter ou limiter";
          summary = "Teneurs trop élevées en sucres ou graisses saturées pour votre profil.";
        } else if (lang === "es") {
          title = "Evitar o limitar";
          summary = "Niveles muy altos de azúcares o grasas saturadas para su perfil.";
        } else {
          title = "Limit consumption";
          summary = "High amounts of sugars or saturated fats detected for your profile.";
        }
      } else if (score < 70) {
        ringColor = "#c2410c"; // Orange
        if (lang === "fr") {
          title = "À utiliser occasionnellement";
          summary = "Ce produit est tolérable, mais nécessite une surveillance de ses composants.";
        } else if (lang === "es") {
          title = "Uso ocasional";
          summary = "Este producto es aceptable, pero requiere vigilar sus componentes.";
        } else {
          title = "Use occasionally";
          summary = "This product is acceptable, but components require close monitoring.";
        }
      } else {
        if (lang === "fr") {
          title = "Excellent choix";
          summary = "Ce produit s'intègre parfaitement dans vos objectifs de santé.";
        } else if (lang === "es") {
          title = "Excelente opción";
          summary = "Este producto se alinea perfectamente con sus metas de salud.";
        }
      }
      
      // Mise à jour sécurisée de l'interface utilisateur
      const overallRing = document.getElementById("overallRing");
      const overallScore = document.getElementById("overallScore");
      const resultTitle = document.getElementById("resultTitle");
      const resultSummary = document.getElementById("resultSummary");
      
      if (overallRing) {
        overallRing.style.setProperty("--score", score);
        overallRing.style.setProperty("--ring-color", ringColor);
      }
      if (overallScore) overallScore.textContent = score;
      if (resultTitle) resultTitle.textContent = title;
      if (resultSummary) resultSummary.textContent = summary;
    });
  }
});
