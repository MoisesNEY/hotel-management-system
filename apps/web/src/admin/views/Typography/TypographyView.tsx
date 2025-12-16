import React from 'react';
import Card from '../../components/shared/Card';

const TypographyView: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Tipografía</h1>
                <p className="text-gray-600">
                    Ejemplos de estilos tipográficos disponibles
                </p>
            </div>

            {/* Headings */}
            <Card title="Encabezados" className="shadow-md border-none">
                <div className="space-y-4">
                    <div>
                        <h1 className="text-5xl font-bold text-gray-800">Heading 1</h1>
                        <code className="text-xs text-gray-500">text-5xl font-bold</code>
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold text-gray-800">Heading 2</h2>
                        <code className="text-xs text-gray-500">text-4xl font-bold</code>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-800">Heading 3</h3>
                        <code className="text-xs text-gray-500">text-3xl font-bold</code>
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold text-gray-800">Heading 4</h4>
                        <code className="text-xs text-gray-500">text-2xl font-bold</code>
                    </div>
                    <div>
                        <h5 className="text-xl font-bold text-gray-800">Heading 5</h5>
                        <code className="text-xs text-gray-500">text-xl font-bold</code>
                    </div>
                    <div>
                        <h6 className="text-lg font-bold text-gray-800">Heading 6</h6>
                        <code className="text-xs text-gray-500">text-lg font-bold</code>
                    </div>
                </div>
            </Card>

            {/* Paragraphs */}
            <Card title="Párrafos y Texto" className="shadow-md border-none">
                <div className="space-y-4">
                    <div>
                        <p className="text-lg text-gray-700">
                            Este es un párrafo grande. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                        <code className="text-xs text-gray-500">text-lg</code>
                    </div>
                    <div>
                        <p className="text-base text-gray-700">
                            Este es un párrafo de tamaño normal. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                        </p>
                        <code className="text-xs text-gray-500">text-base</code>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">
                            Este es un párrafo pequeño. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </p>
                        <code className="text-xs text-gray-500">text-sm</code>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">
                            Este es un texto muy pequeño, usado para notas y anotaciones.
                        </p>
                        <code className="text-xs text-gray-500">text-xs</code>
                    </div>
                </div>
            </Card>

            {/* Text Styles */}
            <Card title="Estilos de Texto" className="shadow-md border-none">
                <div className="space-y-3">
                    <p className="text-gray-700">
                        Texto <strong className="font-bold">en negrita</strong> usando font-bold
                    </p>
                    <p className="text-gray-700">
                        Texto <em className="italic">en cursiva</em> usando italic
                    </p>
                    <p className="text-gray-700">
                        Texto <span className="underline">subrayado</span> usando underline
                    </p>
                    <p className="text-gray-700">
                        Texto <span className="line-through">tachado</span> usando line-through
                    </p>
                    <p className="text-gray-700">
                        Texto <span className="uppercase">en mayúsculas</span> usando uppercase
                    </p>
                    <p className="text-gray-700">
                        Texto <span className="lowercase">EN MINÚSCULAS</span> usando lowercase
                    </p>
                    <p className="text-gray-700">
                        Texto <span className="capitalize">capitalizado en cada palabra</span> usando capitalize
                    </p>
                </div>
            </Card>

            {/* Colors */}
            <Card title="Colores de Texto" className="shadow-md border-none">
                <div className="space-y-2">
                    <p className="text-gray-900">Texto en gris oscuro (text-gray-900)</p>
                    <p className="text-gray-700">Texto en gris medio (text-gray-700)</p>
                    <p className="text-gray-500">Texto en gris claro (text-gray-500)</p>
                    <p className="text-blue-600">Texto en azul (text-blue-600)</p>
                    <p className="text-green-600">Texto en verde (text-green-600)</p>
                    <p className="text-red-600">Texto en rojo (text-red-600)</p>
                    <p className="text-orange-600">Texto en naranja (text-orange-600)</p>
                    <p className="text-purple-600">Texto en morado (text-purple-600)</p>
                </div>
            </Card>

            {/* Lists */}
            <Card title="Listas" className="shadow-md border-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Lista Desordenada</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Primer elemento</li>
                            <li>Segundo elemento</li>
                            <li>Tercer elemento
                                <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                                    <li>Sub-elemento 1</li>
                                    <li>Sub-elemento 2</li>
                                </ul>
                            </li>
                            <li>Cuarto elemento</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Lista Ordenada</h4>
                        <ol className="list-decimal list-inside space-y-2 text-gray-700">
                            <li>Primer elemento</li>
                            <li>Segundo elemento</li>
                            <li>Tercer elemento
                                <ol className="list-decimal list-inside ml-6 mt-2 space-y-1">
                                    <li>Sub-elemento 1</li>
                                    <li>Sub-elemento 2</li>
                                </ol>
                            </li>
                            <li>Cuarto elemento</li>
                        </ol>
                    </div>
                </div>
            </Card>

            {/* Blockquote */}
            <Card title="Citas" className="shadow-md border-none">
                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 italic text-gray-700">
                    "Este es un ejemplo de una cita. El diseño es importante, pero la funcionalidad
                    y la experiencia del usuario son primordiales."
                    <footer className="text-sm text-gray-500 mt-2 not-italic">
                        — Autor Desconocido
                    </footer>
                </blockquote>
            </Card>

            {/* Code */}
            <Card title="Código" className="shadow-md border-none">
                <div className="space-y-4">
                    <div>
                        <p className="text-gray-700 mb-2">
                            Código inline: <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-red-600">const example = "Hello World";</code>
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-700 mb-2">Bloque de código:</p>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <code className="font-mono text-sm">
                                {`function greeting(name) {
  return \`Hello, \${name}!\`;
}

const message = greeting("World");
console.log(message);`}
                            </code>
                        </pre>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TypographyView;
