import {useQuery} from "@tanstack/react-query";
import ky from "ky";
import Cookies from "js-cookie";
import type {BaseInteger, BaseString, } from "./types";

const token = Cookies.get("authToken")
const BASE_URL = "http://localhost:5000/api";


export const getLevels = async () => {
    const res = await ky.get(`${BASE_URL}/level`, {
    }).json<BaseString[]>();
    return res;
};

export const getDepartments = async () => {
    const res = await ky.get(`${BASE_URL}/department`, {
    }).json<BaseString[]>();
    return res;
};

export const getClassifications = async () => {
    const res = await ky.get(`${BASE_URL}/classification`, {
    }).json<BaseString[]>();
    return res;
};

export const getAccess = async () => {
    const res = await ky.get(`${BASE_URL}/access`, {
    }).json<BaseInteger[]>();
    return res;
};

export const getActiveRetentionPeriod = async () => {
    const res = await ky.get(`${BASE_URL}/retention?active=1`, {
    }).json<BaseInteger[]>();
    return res;
};

export const getInactiveRetentionPeriod = async () => {
    const res = await ky.get(`${BASE_URL}/retention?active=0`, {
    }).json<BaseInteger[]>();
    return res;
};

export const getJRADescription = async () => {
    const res = await ky.get(`${BASE_URL}/jra`, {
    }).json<BaseInteger[]>();
    return res;
};

export const getStorageLocation = async () => {
    const res = await ky.get(`${BASE_URL}/storage`, {
    }).json<BaseInteger[]>();
    return res;
};

export const useLevels = () =>
    useQuery<BaseString[]>({
        queryKey: ["Levels"],
        queryFn: () => getLevels(),
    }); 

export const useDepartments = () =>
    useQuery<BaseString[]>({
        queryKey: ["Departments"],
        queryFn: () => getDepartments(),
    }); 

export const useClassifications = () =>
    useQuery<BaseString[]>({
        queryKey: ["Classifications"],
        queryFn: () => getClassifications(),
    });

export const useAccess = () =>
    useQuery<BaseInteger[]>({
        queryKey: ["Access"],
        queryFn: () => getAccess(),
    });

export const useActiveRetentionPeriods = () =>
    useQuery<BaseInteger[]>({
        queryKey: ["ActiveRetentionPeriod"],
        queryFn: () => getActiveRetentionPeriod(),
    });

export const useInactiveRetentionPeriods = () =>
    useQuery<BaseInteger[]>({
        queryKey: ["InactiveRetentionPeriod"],
        queryFn: () => getInactiveRetentionPeriod(),
    });

export const useJRADescriptions = () =>
    useQuery<BaseInteger[]>({
        queryKey: ["JRADescription"],
        queryFn: () => getJRADescription(),
    });

export const useStorageLocations = () =>
    useQuery<BaseInteger[]>({
        queryKey: ["StorageLocation"],
        queryFn: () => getStorageLocation(),
    });