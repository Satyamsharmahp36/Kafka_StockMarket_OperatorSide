import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Clock, BarChart2, Activity } from 'lucide-react';
import axios from 'axios';

const StockSimulation = () => {
    const [stockData, setStockData] = useState({
        name: '',
        initialPrice: 0,
        finalPrice: 0,
        priceHistory: []
    });

    const [formData, setFormData] = useState({
        name: '',
        initialPrice: '',
        type: '',
        duration: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const webSocket = new WebSocket('ws://localhost:8080/ws/delivery');

        webSocket.onopen = () => {
            console.log('WebSocket connection opened');
        };

        webSocket.onmessage = (event) => {
            const newPrice = parseFloat(event.data);
            setStockData((prevData) => ({
                ...prevData,
                priceHistory: [...prevData.priceHistory, { time: prevData.priceHistory.length, price: newPrice }]
            }));
        };

        webSocket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            webSocket.close();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/location/update', null, {
                params: {
                    name: formData.name,
                    mobNo: formData.initialPrice,
                    type: formData.type,
                    distance: formData.duration
                }
            });

            let priceHistory = [];
            if (response.data.message === "Stock Simulation Completed") {
                priceHistory = response.data.priceHistory || [];
            }

            setStockData({
                name: formData.name,
                initialPrice: parseFloat(formData.initialPrice),
                finalPrice: priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].price : 0,
                priceHistory: priceHistory
            });
        } catch (error) {
            console.error('Error simulating stock:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPriceChangeColor = (initial, final) => {
        const change = final - initial;
        return change >= 0 ? 'text-green-500' : 'text-red-500';
    };

    return (
        <div className="text-black bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <TrendingUp className="h-8 w-8 text-blue-500" />
                            <h1 className="text-2xl font-bold text-gray-900">Stock Market Simulator</h1>
                        </div>
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-blue-600">Live Simulation</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Stock Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <BarChart2 className="h-5 w-5 text-gray-400" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Enter stock name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Initial Price</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </span>
                                    <input
                                        type="number"
                                        placeholder="Enter initial price"
                                        value={formData.initialPrice}
                                        onChange={(e) => setFormData({ ...formData, initialPrice: e.target.value })}
                                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Total Subscribers</label>
                                <input
                                    type="number"
                                    placeholder="No. of users subscribed to the stock"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Simulation Duration</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Clock className="h-5 w-5 text-gray-400" />
                                    </span>
                                    <input
                                        type="number"
                                        placeholder="Duration in seconds"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full p-4 rounded-lg text-white font-medium transition-all
                                ${isLoading 
                                    ? 'bg-blue-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                                }`}
                        >
                            {isLoading ? 'Simulating...' : 'Start Simulation'}
                        </button>
                    </form>
                </div>

                {stockData.priceHistory.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center">
                            <BarChart2 className="h-6 w-6 mr-2 text-blue-500" />
                            {stockData.name} request performance
                        </h2>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Initial Price</p>
                                <p className="text-2xl font-bold">${stockData.initialPrice.toFixed(2)}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Total No. Of request Send</p>
                                <p className="text-2xl font-bold">{formData.duration*1000}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Requets Per Second</p>
                                <p className={`text-2xl font-bold ${getPriceChangeColor(stockData.initialPrice, stockData.finalPrice)}`}>
                                    {1000}
                                </p>
                            </div>
                        </div> 

                         <div className="h-[400px] w-full">
                         <ResponsiveContainer width="100%" height={400}>
    <LineChart data={stockData.priceHistory}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        
        <XAxis 
            dataKey="time" 
            label={{ value: 'Time Period', position: 'bottom' }}
            domain={[Math.max(0, stockData.priceHistory.length - 20), stockData.priceHistory.length]} 
            tickCount={Math.min(stockData.priceHistory.length, 10)}
            allowDataOverflow 
            type="number"
        />

        <YAxis 
            label={{ value: 'Price ($)', angle: -90, position: 'left' }}
            domain={[
                Math.min(...stockData.priceHistory.map(d => d.price)) * 0.9 || 0,
                Math.max(...stockData.priceHistory.map(d => d.price)) * 1.1 || 10
            ]}
            allowDataOverflow
        />

        <Tooltip
            contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
        />

        <Legend />
        
        <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
            name="Stock Price"
        />
    </LineChart>
</ResponsiveContainer>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockSimulation;