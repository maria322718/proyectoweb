const API_URL = "https://jsonplaceholder.typicode.com/users";

export async function findAllUsers() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("No fue posible consultar los usuarios académicos");
  }

  return response.json();
}
