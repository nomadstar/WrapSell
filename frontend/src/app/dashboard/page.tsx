// Dashboard mockup sin componentes externos, solo HTML y Tailwind
'use client';
import { useState } from 'react';

const mockProducts = [
	{
		id: 1,
		name: 'Producto Demo 1',
		status: 'active',
		imageUrl: '/assets/cover.jpg',
		price: '$10.00',
		stock: 20,
		availableAt: new Date(),
	},
	{
		id: 2,
		name: 'Producto Demo 2',
		status: 'inactive',
		imageUrl: '/assets/cover.jpg',
		price: '$15.00',
		stock: 10,
		availableAt: new Date(),
	},
	{
		id: 3,
		name: 'Producto Demo 3',
		status: 'archived',
		imageUrl: '/assets/cover.jpg',
		price: '$20.00',
		stock: 0,
		availableAt: new Date(),
	},
];

const tabs = [
	{ label: 'Todos', value: 'all' },
	{ label: 'Activos', value: 'active' },
	{ label: 'Inactivos', value: 'inactive' },
	{ label: 'Archivados', value: 'archived' },
];

function ProductsTableMock({ products }: { products: typeof mockProducts }) {
	return (
		<div className="overflow-x-auto mt-4">
			<table className="min-w-full bg-white border border-gray-200 rounded-md">
				<thead>
					<tr>
						<th className="px-4 py-2">Imagen</th>
						<th className="px-4 py-2">Nombre</th>
						<th className="px-4 py-2">Estado</th>
						<th className="px-4 py-2">Precio</th>
						<th className="px-4 py-2">Stock</th>
						<th className="px-4 py-2">Disponible desde</th>
					</tr>
				</thead>
				<tbody>
					{products.map((p) => (
						<tr key={p.id} className="text-center border-t">
							<td className="px-4 py-2">
								<img
									src={p.imageUrl}
									alt={p.name}
									className="w-12 h-12 object-cover rounded"
								/>
							</td>
							<td className="px-4 py-2">{p.name}</td>
							<td className="px-4 py-2 capitalize">{p.status}</td>
							<td className="px-4 py-2">{p.price}</td>
							<td className="px-4 py-2">{p.stock}</td>
							<td className="px-4 py-2">
								{p.availableAt.toLocaleDateString()}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default function DashboardPage() {
	const [activeTab, setActiveTab] = useState('all');
	let filteredProducts = mockProducts;
	if (activeTab !== 'all') {
		filteredProducts = mockProducts.filter((p) => p.status === activeTab);
	}

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">Dashboard de Productos</h1>
			<div className="flex items-center mb-4 gap-4 flex-wrap">
				<div className="flex gap-2">
					{tabs.map((tab) => (
						<button
							key={tab.value}
							className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
								activeTab === tab.value
									? 'bg-blue-600 text-white'
									: 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
							}`}
							onClick={() => setActiveTab(tab.value)}
						>
							{tab.label}
						</button>
					))}
				</div>
				<div className="ml-auto flex items-center gap-2">
					<button className="h-8 px-3 py-1 border rounded-md text-sm bg-white hover:bg-gray-100 flex items-center gap-1">
						<span>⬇️</span>
						<span className="hidden sm:inline">Exportar</span>
					</button>
					<button className="h-8 px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1">
						<span>＋</span>
						<span className="hidden sm:inline">Agregar Producto</span>
					</button>
				</div>
			</div>
			<ProductsTableMock products={filteredProducts} />
		</div>
	);
}
