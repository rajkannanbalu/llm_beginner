import React, { useState, useEffect } from 'react';
import { ArrowRight, Brain, MessageSquare, Layers, Settings, AlertCircle } from 'lucide-react';

const LLMVisualization = () => {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [embeddings, setEmbeddings] = useState([]);
  const [attentionHeads, setAttentionHeads] = useState([]);
  const [ffnStates, setFfnStates] = useState([]);
  const [outputTokens, setOutputTokens] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [selectedHead, setSelectedHead] = useState(0);
  const [speed, setSpeed] = useState(1500);

  const NUM_LAYERS = 3;
  const NUM_HEADS = 4;
  const sampleTokens = ["The", "quick", "brown", "fox", "jumps"];
  const summary = ["A", "fox", "jumps"];

  // Generate random embeddings
  const generateEmbedding = () => {
    return Array.from({ length: 8 }, () => Math.random().toFixed(2));
  };

  // Generate attention scores for multiple heads
  const generateMultiHeadAttention = (tokenCount) => {
    return Array.from({ length: NUM_HEADS }, () => 
      Array.from({ length: tokenCount }, () => 
        Array.from({ length: tokenCount }, () => 
          parseFloat(Math.random().toFixed(2))
        )
      )
    );
  };

  // Generate FFN states
  const generateFFNState = (tokenCount) => {
    return Array.from({ length: tokenCount }, () => ({
      input: Array.from({ length: 4 }, () => Math.random().toFixed(2)),
      hidden: Array.from({ length: 4 }, () => Math.random().toFixed(2)),
      output: Array.from({ length: 4 }, () => Math.random().toFixed(2))
    }));
  };

  useEffect(() => {
    if (!isProcessing) return;

    if (step < sampleTokens.length) {
      const timer = setTimeout(() => {
        setTokens(prev => [...prev, sampleTokens[step]]);
        
        // Add embedding vector
        setTimeout(() => {
          setEmbeddings(prev => [...prev, generateEmbedding()]);
        }, speed / 3);
        
        // Update attention heads for all layers
        setTimeout(() => {
          setAttentionHeads(prev => {
            const newHeads = [...prev];
            for (let layer = 0; layer < NUM_LAYERS; layer++) {
              if (!newHeads[layer]) newHeads[layer] = [];
              newHeads[layer] = generateMultiHeadAttention(step + 1);
            }
            return newHeads;
          });
        }, speed / 2);

        // Update FFN states
        setTimeout(() => {
          setFfnStates(prev => {
            const newStates = [...prev];
            for (let layer = 0; layer < NUM_LAYERS; layer++) {
              if (!newStates[layer]) newStates[layer] = [];
              newStates[layer] = generateFFNState(step + 1);
            }
            return newStates;
          });
        }, 2 * speed / 3);
        
        setStep(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (step === sampleTokens.length) {
      const timer = setTimeout(() => {
        setOutputTokens([]);
        let outStep = 0;
        const outputTimer = setInterval(() => {
          if (outStep < summary.length) {
            setOutputTokens(prev => [...prev, summary[outStep]]);
            outStep++;
          } else {
            clearInterval(outputTimer);
            setIsProcessing(false);
            setStep(0);
          }
        }, speed);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [step, isProcessing, speed]);

  const startAnimation = () => {
    setTokens([]);
    setEmbeddings([]);
    setAttentionHeads([]);
    setFfnStates([]);
    setOutputTokens([]);
    setStep(0);
    setIsProcessing(true);
  };

  const AttentionMatrix = ({ scores }) => (
    <div className="grid gap-1" style={{ 
      gridTemplateColumns: `repeat(${scores.length}, minmax(0, 1fr))` 
    }}>
      {scores.map((row, i) => (
        row.map((score, j) => (
          <div
            key={`${i}-${j}`}
            className="w-6 h-6 rounded"
            style={{
              backgroundColor: `rgba(147, 51, 234, ${score})`,
              transition: 'background-color 0.3s'
            }}
          />
        ))
      ))}
    </div>
  );

  const FFNVisualization = ({ state }) => (
    <div className="flex flex-col items-center gap-2">
      <div className="grid grid-cols-4 gap-1">
        {state.input.map((value, i) => (
          <div key={i} className="w-6 h-6 bg-blue-200 rounded flex items-center justify-center text-xs">
            {value}
          </div>
        ))}
      </div>
      <ArrowRight size={16} />
      <div className="grid grid-cols-4 gap-1">
        {state.hidden.map((value, i) => (
          <div key={i} className="w-6 h-6 bg-purple-200 rounded flex items-center justify-center text-xs">
            {value}
          </div>
        ))}
      </div>
      <ArrowRight size={16} />
      <div className="grid grid-cols-4 gap-1">
        {state.output.map((value, i) => (
          <div key={i} className="w-6 h-6 bg-green-200 rounded flex items-center justify-center text-xs">
            {value}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl p-6 space-y-8">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={startAnimation}
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isProcessing ? 'Processing...' : 'Start Animation'}
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Speed:</span>
            <input
              type="range"
              min="500"
              max="3000"
              step="500"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-32"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span>Layer:</span>
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(Number(e.target.value))}
              className="p-1 border rounded"
            >
              {Array.from({ length: NUM_LAYERS }, (_, i) => (
                <option key={i} value={i}>Layer {i + 1}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {/* Input Tokens */}
        <div className="w-full bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <MessageSquare className="mr-2" size={20} />
            <span className="font-semibold">Input Tokens</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tokens.map((token, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded animate-fade-in">
                {token}
              </span>
            ))}
          </div>
        </div>

        {/* Token Embeddings */}
        <div className="w-full bg-orange-100 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Layers className="mr-2" size={20} />
            <span className="font-semibold">Token Embeddings</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {embeddings.map((embedding, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-sm text-gray-600 mb-1">{tokens[idx]}</span>
                <div className="grid grid-cols-4 gap-1">
                  {embedding.map((value, i) => (
                    <div key={i} className="w-6 h-6 flex items-center justify-center text-xs bg-orange-200 rounded">
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Head Attention */}
        <div className="w-full bg-purple-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Brain className="mr-2" size={20} />
              <span className="font-semibold">Multi-Head Attention (Layer {selectedLayer + 1})</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Head:</span>
              <select
                value={selectedHead}
                onChange={(e) => setSelectedHead(Number(e.target.value))}
                className="p-1 border rounded"
              >
                {Array.from({ length: NUM_HEADS }, (_, i) => (
                  <option key={i} value={i}>Head {i + 1}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            {attentionHeads[selectedLayer]?.[selectedHead] && (
              <AttentionMatrix scores={attentionHeads[selectedLayer][selectedHead]} />
            )}
          </div>
        </div>

        {/* Feed-Forward Network */}
        <div className="w-full bg-blue-100 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Settings className="mr-2" size={20} />
            <span className="font-semibold">Feed-Forward Network (Layer {selectedLayer + 1})</span>
          </div>
          <div className="flex justify-center gap-8 overflow-x-auto">
            {ffnStates[selectedLayer]?.map((state, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-sm text-gray-600 mb-1">{tokens[idx]}</span>
                <FFNVisualization state={state} />
              </div>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="w-full bg-green-100 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <MessageSquare className="mr-2" size={20} />
            <span className="font-semibold">Generated Output</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {outputTokens.map((token, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-green-200 text-green-800 rounded animate-fade-in"
              >
                {token}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <AlertCircle className="mr-2" size={20} />
          <span className="font-semibold">Legend</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Colors Represent:</h4>
            <ul className="space-y-1">
              <li>• Blue: Input values</li>
              <li>• Purple: Hidden layer values</li>
              <li>• Green: Output values</li>
              <li>• Orange: Token embeddings</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Interactive Elements:</h4>
            <ul className="space-y-1">
              <li>• Layer selector: Switch between transformer layers</li>
              <li>• Head selector: View different attention heads</li>
              <li>• Speed control: Adjust animation speed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMVisualization;