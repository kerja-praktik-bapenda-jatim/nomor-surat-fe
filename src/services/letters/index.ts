import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type { Letters } from "./types";
import Cookies from "js-cookie";

export const getLetters = async () => {
  const token = Cookies.get("authToken")

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
