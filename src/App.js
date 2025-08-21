import React, { useState, useEffect } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [meals, setMeals] = useState([]);

  // Produkty
  const [productName, setProductName] = useState("");
  const [productCalories, setProductCalories] = useState("");

  // Dania
  const [dishName, setDishName] = useState("");
  const [dishIngredients, setDishIngredients] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedGrams, setSelectedGrams] = useState("");

  // Zjedzony posiłek
  const [mealType, setMealType] = useState("product"); // product | dish | other
  const [mealItem, setMealItem] = useState(""); // wybrane id produktu lub dania
  const [mealQuantity, setMealQuantity] = useState("");
  const [externalName, setExternalName] = useState("");
  const [externalCalories, setExternalCalories] = useState("");
  const [mealDate, setMealDate] = useState("");

  // Załaduj z localStorage
  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem("products") || "[]");
    const savedDishes = JSON.parse(localStorage.getItem("dishes") || "[]");
    const savedMeals = JSON.parse(localStorage.getItem("meals") || "[]");
    setProducts(savedProducts);
    setDishes(savedDishes);
    setMeals(savedMeals);
  }, []);

  // Zapisz do localStorage
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem("dishes", JSON.stringify(dishes));
  }, [dishes]);
  useEffect(() => {
    localStorage.setItem("meals", JSON.stringify(meals));
  }, [meals]);

  const addProduct = () => {
    if (!productName || !productCalories) return;
    setProducts([
      ...products,
      { id: Date.now(), name: productName, calories: Number(productCalories) },
    ]);
    setProductName("");
    setProductCalories("");
  };

  const addIngredientToDish = () => {
    if (!selectedProduct || !selectedGrams) return;
    const prod = products.find((p) => p.id === Number(selectedProduct));
    if (!prod) return;
    setDishIngredients([
      ...dishIngredients,
      { ...prod, grams: Number(selectedGrams) },
    ]);
    setSelectedProduct("");
    setSelectedGrams("");
  };

  const removeIngredientFromDish = (index) => {
    setDishIngredients(dishIngredients.filter((_, i) => i !== index));
  };

  const addDish = () => {
    if (!dishName || dishIngredients.length === 0) return;

    const dishMacros = dishIngredients.reduce(
      (memo, curr) => {
        return [
          memo[0] + (curr.calories * curr.grams) / 100,
          memo[1] + curr.grams,
        ];
      },
      [0, 0]
    );

    setDishes([
      ...dishes,
      {
        id: Date.now(),
        name: dishName,
        ingredients: dishIngredients,
        calories: (dishMacros[0] * 100) / 3,
      },
    ]);
    setDishName("");
    setDishIngredients([]);
  };

  const addMeal = () => {
    if (!mealDate) return;

    let name = "";
    let calories = 0;
    let grams = 0;

    if (mealType === "product") {
      const prod = products.find((p) => p.id === Number(mealItem));
      if (!prod || !mealQuantity) return;
      name = prod.name;
      calories = (prod.calories * Number(mealQuantity)) / 100;
      grams = mealQuantity;
    } else if (mealType === "dish") {
      const dish = dishes.find((d) => d.id === Number(mealItem));
      if (!dish || !mealQuantity) return;
      name = dish.name;
      const dishCalories = dish.calories;
      calories = (dishCalories * Number(mealQuantity)) / 100;
      grams = mealQuantity;
    } else if (mealType === "other") {
      if (!externalName || !externalCalories) return;
      name = externalName;
      calories = Number(externalCalories);
      setExternalName("");
      setExternalCalories("");
    }

    setMeals([
      ...meals,
      {
        id: Date.now(),
        date: mealDate,
        name,
        calories,
        grams,
      },
    ]);
    setMealItem("");
    setMealQuantity("");
    setMealDate("");
  };

  const removeMeal = (id) => {
    setMeals(meals.filter((m) => m.id !== id));
  };

  // Funkcje pomocnicze
  const getDailyCalories = (date) => {
    return meals
      .filter((m) => m.date === date)
      .reduce((sum, m) => sum + m.calories, 0);
  };

  // Suma kalorii w bieżącym tygodniu
  const getWeeklyCalories = (date) => {
    const current = new Date(date);
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - current.getDay() + 1); // poniedziałek
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return meals
      .filter((m) => {
        const mealDate = new Date(m.date);
        return mealDate >= startOfWeek && mealDate <= endOfWeek;
      })
      .reduce((sum, m) => sum + m.calories, 0);
  };

  // Suma kalorii w bieżącym miesiącu
  const getMonthlyCalories = (date) => {
    const current = new Date(date);
    const month = current.getMonth();
    const year = current.getFullYear();
    return meals
      .filter((m) => {
        const mealDate = new Date(m.date);
        return mealDate.getMonth() === month && mealDate.getFullYear() === year;
      })
      .reduce((sum, m) => sum + m.calories, 0);
  };

  const [summaryDate, setSummaryDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Dodaj produkt</h1>
      <div className="flex space-x-2">
        <input
          placeholder="Nazwa"
          className="border p-1"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <input
          placeholder="Kalorie/100g"
          type="number"
          className="border p-1"
          value={productCalories}
          onChange={(e) => setProductCalories(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-2" onClick={addProduct}>
          Dodaj
        </button>
      </div>

      <h1 className="text-xl font-bold">Dodaj danie</h1>
      <input
        placeholder="Nazwa dania"
        className="border p-1 mb-2"
        value={dishName}
        onChange={(e) => setDishName(e.target.value)}
      />
      <div className="flex space-x-2 mb-2">
        <select
          className="border p-1"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">Wybierz produkt</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Gramatura"
          type="number"
          className="border p-1"
          value={selectedGrams}
          onChange={(e) => setSelectedGrams(e.target.value)}
        />
        <button
          className="bg-green-500 text-white px-2"
          onClick={addIngredientToDish}
        >
          Dodaj składnik
        </button>
      </div>
      <ul>
        {dishIngredients.map((ing, i) => (
          <li key={i} className="flex justify-between items-center">
            {ing.name} - {ing.grams}g
            <button
              className="text-red-500"
              onClick={() => removeIngredientFromDish(i)}
            >
              Usuń
            </button>
          </li>
        ))}
      </ul>
      <button className="bg-purple-500 text-white px-2 mt-2" onClick={addDish}>
        Dodaj danie
      </button>

      <h1 className="text-xl font-bold">Dodaj zjedzony posiłek</h1>
      <div className="flex space-x-2 mb-2">
        <select
          className="border p-1"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        >
          <option value="product">Produkt</option>
          <option value="dish">Danie</option>
          <option value="other">Zewnętrzny posiłek</option>
        </select>
        <input
          type="date"
          className="border p-1"
          value={mealDate}
          onChange={(e) => setMealDate(e.target.value)}
        />
      </div>

      {mealType === "product" && (
        <div className="flex space-x-2 mb-2">
          <select
            className="border p-1"
            value={mealItem}
            onChange={(e) => setMealItem(e.target.value)}
          >
            <option value="">Wybierz produkt</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Gramatura"
            type="number"
            className="border p-1"
            value={mealQuantity}
            onChange={(e) => setMealQuantity(e.target.value)}
          />
        </div>
      )}

      {mealType === "dish" && (
        <div className="flex space-x-2 mb-2">
          <select
            className="border p-1"
            value={mealItem}
            onChange={(e) => setMealItem(e.target.value)}
          >
            <option value="">Wybierz danie</option>
            {dishes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Gramatura"
            type="number"
            className="border p-1"
            value={mealQuantity}
            onChange={(e) => setMealQuantity(e.target.value)}
          />
        </div>
      )}

      {mealType === "other" && (
        <div className="flex space-x-2 mb-2">
          <input
            placeholder="Nazwa posiłku"
            className="border p-1"
            value={externalName}
            onChange={(e) => setExternalName(e.target.value)}
          />
          <input
            placeholder="Kalorie"
            type="number"
            className="border p-1"
            value={externalCalories}
            onChange={(e) => setExternalCalories(e.target.value)}
          />
        </div>
      )}

      <button className="bg-yellow-500 text-white px-2" onClick={addMeal}>
        Dodaj posiłek
      </button>

      <div className="mb-4">
        <label className="mr-2 font-semibold">Wybierz datę:</label>
        <input
          type="date"
          className="border p-1"
          value={summaryDate}
          onChange={(e) => setSummaryDate(e.target.value)}
        />
      </div>

      <div className="flex space-x-4">
        {/* Dzień */}
        <div className="border p-4 rounded w-1/3">
          <h3 className="font-semibold mb-2 text-center">Dzień</h3>
          <p className="text-lg text-center mb-2">
            {getDailyCalories(summaryDate).toFixed(2)} kcal
          </p>
          <ul className="list-disc pl-5">
            {meals
              .filter((m) => m.date === summaryDate)
              .map((m) => {
                console.log(m);
                return (
                  <li key={m.id} className="flex justify-between items-center">
                    {m.date} - {m.name} - {m.grams}g - {m.calories.toFixed(0)}{" "}
                    kcal
                    <button
                      className="text-red-500"
                      onClick={() => removeMeal(m.id)}
                    >
                      Usuń
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Tydzień */}
        <div className="border p-4 rounded w-1/3 text-center">
          <h3 className="font-semibold mb-2">Tydzień</h3>
          <p className="text-lg">
            {getWeeklyCalories(summaryDate).toFixed(2)} kcal
          </p>
        </div>

        {/* Miesiąc */}
        <div className="border p-4 rounded w-1/3 text-center">
          <h3 className="font-semibold mb-2">Miesiąc</h3>
          <p className="text-lg">
            {getMonthlyCalories(summaryDate).toFixed(2)} kcal
          </p>
        </div>
      </div>
    </div>
  );
}
