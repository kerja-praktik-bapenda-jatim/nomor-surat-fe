import {useQuery} from "@tanstack/react-query";
import ky from "ky";
import Cookies from "js-cookie";
import type {BaseString} from "./types";

const token = Cookies.get("authToken")
const BASE_URL = process.env.API_BASE_URL as string;

export const getLevels = async () => {
    const res = await ky.get(`${BASE_URL}level`, {
    }).json<BaseString[]>();
    return res;
};

export const getDepartments = async () => {
    const res = await ky.get(`${BASE_URL}department`, {
    }).json<BaseString[]>();
    return res;
};

export const getClassifications = async () => {
    const res = await ky.get(`${BASE_URL}classification`, {
    }).json<BaseString[]>();
    return res;
};

export const getAccess = async () => {
    const res = await ky.get(`${BASE_URL}access`, {
    }).json<BaseString[]>();
    return res;
};

export const getActiveRetentionPeriod = async () => {
    const res = await ky.get(`${BASE_URL}retention?active=1`, {
    }).json<BaseString[]>();
    return res;
};

export const getInactiveRetentionPeriod = async () => {
    const res = await ky.get(`${BASE_URL}retention?active=0`, {
    }).json<BaseString[]>();
    return res;
};

export const getJRADescription = async () => {
    const res = await ky.get(`${BASE_URL}jra`, {
    }).json<BaseString[]>();
    return res;
};

export const getStorageLocation = async () => {
    const res = await ky.get(`${BASE_URL}storage`, {
    }).json<BaseString[]>();
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
    useQuery<BaseString[]>({
        queryKey: ["Access"],
        queryFn: () => getAccess(),
    });

export const useActiveRetentionPeriods = () =>
    useQuery<BaseString[]>({
        queryKey: ["ActiveRetentionPeriod"],
        queryFn: () => getActiveRetentionPeriod(),
    });

export const useInactiveRetentionPeriods = () =>
    useQuery<BaseString[]>({
        queryKey: ["InactiveRetentionPeriod"],
        queryFn: () => getInactiveRetentionPeriod(),
    });

export const useJRADescriptions = () =>
    useQuery<BaseString[]>({
        queryKey: ["JRADescription"],
        queryFn: () => getJRADescription(),
    });

export const useStorageLocations = () =>
    useQuery<BaseString[]>({
        queryKey: ["StorageLocation"],
        queryFn: () => getStorageLocation(),
    });
