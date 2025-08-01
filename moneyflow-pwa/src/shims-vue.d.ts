declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}


declare module 'bootstrap' {
    export const Tooltip: any;
}