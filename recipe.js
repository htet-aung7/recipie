const searchInput = document.getElementById("searchInput");
const recipeGrid = document.getElementById("recipeGrid");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");
const recipeModal = document.getElementById("recipeModal");
const modalContent = document.getElementById("modalContent");

// Enter key press support for search
searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchMeals();
  }
});

async function searchMeals() {
  const query = searchInput.value.trim();
  if (!query) return;

  // UI State adjustments
  loading.classList.remove("hidden");
  recipeGrid.innerHTML = "";
  errorMsg.classList.add("hidden");

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`,
    );
    const data = await response.json();

    loading.classList.add("hidden");

    if (data.meals) {
      displayMeals(data.meals);
    } else {
      errorMsg.classList.remove("hidden");
    }
  } catch (error) {
    loading.classList.add("hidden");
    errorMsg.classList.remove("hidden");
    console.error("Error fetching data:", error);
  }
}

function displayMeals(meals) {
  recipeGrid.innerHTML = meals
    .map(
      (meal) => `
        <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition flex flex-col justify-between">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-48 object-cover">
            <div class="p-4 flex flex-col flex-grow">
                <span class="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">${meal.strCategory || "General"}</span>
                <h3 class="font-bold text-lg text-gray-800 mb-4">${meal.strMeal}</h3>
                <button onclick="getMealDetails('${meal.idMeal}')" 
                    class="mt-auto w-full bg-orange-50 text-orange-600 font-semibold py-2 rounded-lg hover:bg-orange-600 hover:text-white transition">
                    View Recipe
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

async function getMealDetails(mealId) {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`,
    );
    const data = await response.json();
    const meal = data.meals[0];

    let ingredients = [];
    for (let i = 1; i <= 20; i++) {
      if (meal[`strIngredient${i}`]) {
        ingredients.push(
          `${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`,
        );
      } else {
        break;
      }
    }

    modalContent.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-2">${meal.strMeal}</h2>
            <p class="text-sm text-gray-500 mb-4">Category: <span class="font-semibold text-gray-700">${meal.strCategory}</span> | Area: <span class="font-semibold text-gray-700">${meal.strArea}</span></p>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-64 object-cover rounded-lg mb-4 shadow-md">
            
            <h3 class="font-bold text-lg text-gray-800 mb-2">Ingredients:</h3>
            <ul class="list-disc list-inside mb-4 text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-1">
                ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
            </ul>

            <h3 class="font-bold text-lg text-gray-800 mb-2">Instructions:</h3>
            <p class="text-gray-700 whitespace-pre-line leading-relaxed mb-6">${meal.strInstructions}</p>
            
            ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="inline-block bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition">Watch Video Tutorial</a>` : ""}
        `;

    recipeModal.classList.remove("hidden");
  } catch (error) {
    console.error("Error fetching meal details:", error);
  }
}

function closeModal() {
  recipeModal.classList.add("hidden");
}

// Close modal when clicking outside of it
window.onclick = function (event) {
  if (event.target == recipeModal) {
    closeModal();
  }
};
