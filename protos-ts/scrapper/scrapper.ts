/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "scrapper";

export interface ScrapperName {
  name: string;
  link: string;
  found: boolean;
  metadata: ScrapperMetadata[];
}

export interface ScrapperEmail {
  hasPassword: boolean;
  password: string;
  sha1: string;
  hash: string;
  sources: string[];
}

export interface ScrapperResume {
  emails: string[];
  cities: string[];
  addresses: string[];
  phones: string[];
  urls: string[];
}

export interface ScrapperFace {
  link: string;
  metadata: ScrapperMetadata[];
}

export interface ScrapperMetadata {
  name: string;
  value: string;
}

export interface GetByNameRequest {
  lastName: string;
  firstName: string;
  demo: boolean;
}

export interface GetByNameResponse {
  data: ScrapperName[];
}

export interface GetByEmailRequest {
  email: string;
}

export interface GetByEmailResponse {
  data: ScrapperEmail[];
}

export interface GetByResumeRequest {
  file: Uint8Array;
}

export interface GetByResumeResponse {
  data: ScrapperResume | undefined;
}

export interface GetByFaceRequest {
  lastName: string;
  firstName: string;
  file: Uint8Array;
}

export interface GetByFaceResponse {
  data: ScrapperFace[];
}

export const SCRAPPER_PACKAGE_NAME = "scrapper";

export interface ScrapperServiceClient {
  getByName(request: GetByNameRequest, metadata?: Metadata): Observable<GetByNameResponse>;

  getByEmail(request: GetByEmailRequest, metadata?: Metadata): Observable<GetByEmailResponse>;

  getByResume(request: GetByResumeRequest, metadata?: Metadata): Observable<GetByResumeResponse>;

  getByFace(request: GetByFaceRequest, metadata?: Metadata): Observable<GetByFaceResponse>;
}

export interface ScrapperServiceController {
  getByName(
    request: GetByNameRequest,
    metadata?: Metadata,
  ): Promise<GetByNameResponse> | Observable<GetByNameResponse> | GetByNameResponse;

  getByEmail(
    request: GetByEmailRequest,
    metadata?: Metadata,
  ): Promise<GetByEmailResponse> | Observable<GetByEmailResponse> | GetByEmailResponse;

  getByResume(
    request: GetByResumeRequest,
    metadata?: Metadata,
  ): Promise<GetByResumeResponse> | Observable<GetByResumeResponse> | GetByResumeResponse;

  getByFace(
    request: GetByFaceRequest,
    metadata?: Metadata,
  ): Promise<GetByFaceResponse> | Observable<GetByFaceResponse> | GetByFaceResponse;
}

export function ScrapperServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getByName", "getByEmail", "getByResume", "getByFace"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ScrapperService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ScrapperService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const SCRAPPER_SERVICE_NAME = "ScrapperService";
