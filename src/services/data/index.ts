import {useQuery} from "@tanstack/react-query";
import ky from "ky";
import Cookies from "js-cookie";
import type {Classifications, Departments, Levels} from "./types";

const token = Cookies.get("authToken")
const BASE_URL = "http://localhost:5000/api";


export const getLevels = async () => {
    const res = await ky.get(`${BASE_URL}/level`, {
    }).json<Levels[]>();
    return res;
};

export const getDepartments = async () => {
    const res = await ky.get(`${BASE_URL}/department`, {
    }).json<Departments[]>();
    return res;
};

export const getClassifications = async () => {
    const res = await ky.get(`${BASE_URL}/classification`, {
    }).json<Classifications[]>();
    return res;
};

export const useLevels = () =>
    useQuery<Levels[]>({
        queryKey: ["Levels"],
        queryFn: () => getLevels(),
    }); 

export const useDepartments = () =>
    useQuery<Departments[]>({
        queryKey: ["Departments"],
        queryFn: () => getDepartments(),
    }); 

export const useClassifications = () =>
    useQuery<Classifications[]>({
        queryKey: ["Classifications"],
        queryFn: () => getClassifications(),
    }); 