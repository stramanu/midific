import {CONFIG as DEV_CONFIG} from './configuration.dev';
import {CONFIG as PROD_CONFIG} from './configuration.prod';

export function CONFIG() {
    return process.env.PRODUCTION == "true" ? PROD_CONFIG : DEV_CONFIG
}