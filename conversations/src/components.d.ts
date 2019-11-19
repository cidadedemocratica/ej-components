/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';


export namespace Components {
  interface EjConversation {
    /**
    * The first name
    */
    'first': string;
    /**
    * The last name
    */
    'last': string;
    /**
    * The middle name
    */
    'middle': string;
  }
}

declare global {


  interface HTMLEjConversationElement extends Components.EjConversation, HTMLStencilElement {}
  var HTMLEjConversationElement: {
    prototype: HTMLEjConversationElement;
    new (): HTMLEjConversationElement;
  };
  interface HTMLElementTagNameMap {
    'ej-conversation': HTMLEjConversationElement;
  }
}

declare namespace LocalJSX {
  interface EjConversation {
    /**
    * The first name
    */
    'first'?: string;
    /**
    * The last name
    */
    'last'?: string;
    /**
    * The middle name
    */
    'middle'?: string;
  }

  interface IntrinsicElements {
    'ej-conversation': EjConversation;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements {
      'ej-conversation': LocalJSX.EjConversation & JSXBase.HTMLAttributes<HTMLEjConversationElement>;
    }
  }
}


