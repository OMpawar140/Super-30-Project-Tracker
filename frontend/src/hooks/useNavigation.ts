import React from 'react';
import { useState, createContext, useContext, type ReactNode, type FC } from 'react';

type NavigationContextType = {
    activeTab: string;
    navigateTo: (tabName: string) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

type NavigationProviderProps = {
    children: ReactNode;
};

export const NavigationProvider: FC<NavigationProviderProps> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<string>('Dashboard');
    
    const navigateTo = (tabName: string) => {
        setActiveTab(tabName);
    };

    return React.createElement(
        NavigationContext.Provider,
        { value: { activeTab, navigateTo } },
        children
    );
};

export const useNavigation = (): NavigationContextType => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within NavigationProvider');
    }
    return context;
};