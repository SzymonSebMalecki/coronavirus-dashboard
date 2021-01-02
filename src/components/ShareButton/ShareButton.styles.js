import React from "react";

import styled from "styled-components";
import ShareIcon from "assets/icon-share.svg";

import type { ComponentType } from "react";

export const SharedContainer :ComponentType<*> =
    styled
        .div
        .attrs(({ className="", ...props }) => ({
            className: `share-container ${className}`,
            ...props
        }))`
            margin-top: 10px;
            float: left;
        `;

export const SharedLabel :ComponentType<*> =
    styled
    .p`
        float: left;
        margin-left: 5px !important;
        margin-top: 10px;
        font-size: 10pt;
        font-weight: bold;
        color: #1d70b8;
    `;

export const OptionsContainer :ComponentType<*> =
    styled
        .div`
            display: flex;
            flex: 1 0 100px;
            flex-direction: column;
            position: absolute;
            z-index: 999999999;
            float: left;
            margin-top: 14px;
            margin-right: -15px !important;
            min-width: 100px;
            
            &:focus {
                background-colour: #ffdd00;
            }
            
            & > * {
                display: block;
                padding: 8px 8px;
                background-color: #f1f1f1;
                border-top: 1px solid #e5e5e5;
                border-left: 1px solid #e5e5e5;
                border-right: 1px solid #e5e5e5;
                min-width: 100px;
                text-decoration: none;
                text-align: left;
                
                &:active,
                &:focus,
                &:hover {
                    background-color: #e5e5e5;
                    outline: none;
                    box-shadow: none;
                }
                
                &:focus {
                    background-colour: #ffdd00 !important;
                }
                
                &.disabled {
                    background-color: #f1f1f1;
                    color: #c1c1c1;
                    cursor: not-allowed;
                }
                
                &:first-child {
                    border-top-left-radius: 2px;
                    border-top-right-radius: 2px;
                }
                
                &:last-child {
                    border-bottom: 1px solid #e5e5e5;
                    border-bottom-left-radius: 2px;
                    border-bottom-right-radius: 2px;
                }
            }
            
        `;

export const Launcher: ComponentType<*> = (() => {
    const
        Container = styled.span`
             width: 28px;
             height: 28px;
            display: inline-block;
            position: relative;
            cursor: pointer;
            margin-left: 10px;
            float: left;
            border-left: 1px solid #e8e8e8;
            border-bottom: 1px solid #e8e8e8;
            background-color: #f1f1f1;
            transition: all .3s;
                    
            &.open,
            &:hover,
            &:active {
                background-color: #e1e1e1;
            }
                    
            &:focus {
                background-colour: #ffdd00 !important;
            }
        `,
        Node = styled.button`
            width: 28px;
            height: 28px;
            padding: 2px 3px;
            outline: none;
            cursor: pointer;
            display: flex;
            margin-right: 1px;
            background: url("${ ShareIcon }");
            background-repeat: no-repeat;
            background-size: 24px 24px;
            background-position: center center;
                                
            &:focus {
                background-color: #ffdd00;
            }
        `;
        
    return ({ children, ...props }) => <Container>
        <Node role={ "button" } { ...props }>
            { children }
        </Node>
    </Container>
        
})();