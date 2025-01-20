//src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from 'vue-router';
import { useATMStore } from "@/stores/atm";
import { useBankOnlineStore } from "@/stores/bankonline";

const atmRoutes: RouteRecordRaw[] = [
  {
    path: "welcome",
    name: "Welcome",
    component: () => import("@/views/ATM/WelcomePage.vue"),
  },
  {
    path: "pin-entry",
    name: "PinEntry",
    component: () => import("@/views/ATM/PinEntry.vue"),
  },
  {
    path: "mainatm",
    name: "MainAtm",
    component: () => import("@/views/ATM/MainAtm.vue"),
    children: [
      {
        path: "",
        redirect: "mainmenu", // 默认进入主菜单页面
      },
      {
        path: "mainmenu",
        name: "MainMenu",
        component: () => import("@/views/ATM/MainMenu.vue"),
      },
      {
        path: "deposit",
        name: "Deposit",
        component: () => import("@/views/ATM/Deposit.vue"),
      },
      {
        path: "withdrawal",
        name: "Withdrawal",
        component: () => import("@/views/ATM/Withdrawal.vue"),
      },
      {
        path: "balance-inquiry",
        name: "BalanceInquiry",
        component: () => import("@/views/ATM/BalanceInquiry.vue"),
      },
      {
        path: "transfer",
        name: "Transfer",
        component: () => import("@/views/ATM/TransferPage.vue"),
      },
      {
        path: "transaction-record",
        name: "TransactionRecord",
        component: () => import("@/views/ATM/TransactionRecord.vue"),
      },
      {
        path: '/transaction-receipt/:type/:amount/:recipient?',
        name: "TransactionReceipt",
        component: () => import("@/views/ATM/TransactionReceipt.vue"),
        props: true,

      },
      
      {
        path: "exit",
        name: "Exit",
        component: () => import("@/views/ATM/ExitPage.vue"),
      },
      {
        path: "error",
        name: "Error",
        component: () => import("@/views/ATM/ErrorPage.vue"),
      },
    ],
  },
];

const bankOnlineRoutes: RouteRecordRaw[] = [
  {
    path: "/bankonline/login",
    name: "Login",
    component: () => import("@/views/BankOnline/LoginPage.vue"),
  },
  {
    path: "mainbankonline",
    name: "MainBankOnline",
    component: () => import("@/views/BankOnline/MainBankOnline.vue"),
    children: [
      {
        path: "/",           // 这个/是必须的，否则会导致奇怪的问题，比如在恢复bankonline页面时，路径会变成/atm/dashboard
        redirect: "dashboard", // 默认进入仪表板页面
      },
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/BankOnline/Dashboard.vue"),
      },

      {
        path: "adminsetting",
        name: "AdminSetting",
        component: () => import("@/views/BankOnline/AdminSetting.vue"),
      },
      {
        path: "usersetting",
        name: "UserSetting",
        component: () => import("@/views/BankOnline/UserSetting.vue"),
      },
      {
        path: "atmsetting",
        name: "AtmSetting",
        component: () => import("@/views/BankOnline/AtmSetting.vue"),
      },
      {
        path: "adminchat",
        name: "AdminChat",
        component: () => import("@/views/BankOnline/AdminChat.vue"),
      },
      {
        path: "userchat",
        name: "UserChat",
        component: () => import("@/views/BankOnline/UserChat.vue"),
      },
      {
        path: "myaccount",
        name: "MyAccount",
        component: () => import("@/views/BankOnline/MyAccount.vue"),
      },
      {
        path: "accounttransferrecord",
        name: "AccountTransferRecord",
        component: () => import("@/views/BankOnline/AccountTransferRecord.vue"),
      },
      {
        path: "showqrcode",
        name: "ShowQRCode",
        component: () => import("@/views/BankOnline/ShowQRCode.vue"),
      },
      
    ]
  }
];

const routes: RouteRecordRaw[] = [
  // ATM 模块配置
  {
    path: "/atm",
    name: "ATM",
    beforeEnter: (to, from, next) => {
      const atmStore = useATMStore();
      const publicPages = ['Welcome', 'PinEntry'];
      const isAuthRequired = !publicPages.includes(to.name as string);
      if (isAuthRequired && !atmStore.token) {

        // 未登录时只能访问 welcome 和 pin-entry
        if (to.name !== "Welcome" && to.name !== "PinEntry") {
          console.log("跳转到welcom");
          next("/atm/welcome");

        } else {
          console.log("放行 /atm");
          next();
        }
      } else {
        // 恢复到保存的页面
        if (to.path === "/atm") {
          console.log("恢复到保存的页面");
          next(atmStore.currentPage || "/atm/mainatm/mainmenu");
        } else {
          next();  
        }
      }
    },
    children: atmRoutes,
  },
  
  // BankOnline 模块配置
  {
    path: "/bankonline",
    name: "BankOnline",
    beforeEnter: (to, from, next) => {
      const bankOnlineStore = useBankOnlineStore();
      if (!bankOnlineStore.token) {
        // 未登录时只能访问 login
        if (to.name !== "Login") {
          next({ name: "Login" });
          console.log("跳转到login");
        } else {
          next();
          console.log("login页面");
        }
      } else {
        // 恢复到保存的页面
        if (to.path === "/bankonline") {
          console.log("恢复到保存的页面");
          next(bankOnlineStore.currentPage || "/bankonline/mainbankonline/dashboard");
        } else {
          console.log("放行 /bankonline");
          next();
        }
      }
    },
    children: bankOnlineRoutes,
  },
  // 默认路由重定向
  {
    path: "",
    redirect: "/atm/welcome", // 默认进入 ATM 模块
  },
  // 404 页面
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/components/NotFound.vue"),
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
