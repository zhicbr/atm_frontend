import LibGenerateTestUserSig from './lib-generate-test-usersig-es.min.js';

const SDKAppID = 1600065600; 
const SecretKey = '8ebf00f90dc32e3e2709cd008cf2a11e2fb5d589053d972d1adecf1776d8bb0c'; // 替换为您的 SecretKey
const EXPIRETIME = 604800; // 签名过期时间，单位秒，换算为 7 天

export function genTestUserSig(userId) {
  const generator = new LibGenerateTestUserSig(SDKAppID, SecretKey, EXPIRETIME);
  const userSig = generator.genTestUserSig(userId);
  return { SDKAppID, userSig };
}

/*
使用示例：
import { genTestUserSig } from './services/GenerateUserSig';

const { SDKAppID, userSig } = genTestUserSig('test_user');




**/
