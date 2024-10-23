import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type { Letters } from "./types";

export const getLetters = async () => {
  const token = 'eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NDZjYTg2Yi05YmU4LTQ2OTgtODk0MC0xZmMyYjUxODY1N2IiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNzI5NjUxMDkwLCJleHAiOjE3MzAyNTU4OTB9.LYnksWHpoNyozf-7Hnfk3wu-Mt7nyacQKKdrjw7KsZYi3qaRKheL8utpbfvbx27c';
  
  const res = await ky.get("http://localhost:5000/api/letter",{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).json<Letters[]>();
  return res;
};

export const useLetters = () =>
  useQuery<Letters[]>({
    queryKey: ["Letters"],
    queryFn: () => getLetters(),
  });
