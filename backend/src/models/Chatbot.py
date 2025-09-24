import transformers
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

class Chatbot:

    def __init__(self, model_id: str = "meta-llama/Llama-3.1-8B-Instruct"):
        
        if not torch.cuda.is_available():
            raise RuntimeError("GPU com CUDA não encontrada. Este código é otimizado para rodar em GPU.")

        # Carrega o tokenizer, que prepara o texto para o modelo
        self.tokenizer = AutoTokenizer.from_pretrained(model_id)

        # load_in_4bit=True: Ativa a quantização em 4 bits para reduzir o uso de memória
        # device_map="auto": Envia o modelo automaticamente para a GPU
        self.model = AutoModelForCausalLM.from_pretrained(
            model_id,
            load_in_4bit=True,
            device_map="auto",
            dtype=torch.bfloat16,
        )
        
        terminators = [
            self.tokenizer.eos_token_id,
            self.tokenizer.convert_tokens_to_ids("<|eot_id|>")
        ]

        transformers_pipeline = transformers.pipeline(
            "text-generation",
            model=self.model,
            tokenizer=self.tokenizer,
            max_new_tokens=2048,
            eos_token_id=terminators,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            return_full_text=False,
            repetition_penalty=1.15,
        )

        self.llm = HuggingFacePipeline(pipeline=transformers_pipeline)

        prompt_system = "Você é o 'Roteiro.AI', um assistente de viagens especialista e criativo. Sua tarefa é criar um roteiro de viagem excepcional, detalhado dia por dia e útil. Forneça sugestões de atividades para manhã, tarde e noite, incluindo dicas locais e opções de restaurantes autênticos. Lembre-se de adaptar o roteiro ao destino fornecido pelo usuário e garantir que seja prático e agradável. Além disso, organize o roteiro em formato de tabela para melhor visualização."

        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", prompt_system),
            ("user", "{user_input}")
        ])

        self.output_parser = StrOutputParser()

        self.chain = self.prompt_template | self.llm | self.output_parser

        print("Chatbot inicializado com sucesso!")

    def generate_responses(self, prompt_user: str):
        """
            Gera um roteiro de viagem detalhado usando o Llama 3.
        """

        print("\nIniciando a geração do roteiro com Llama 3..")

        response = self.chain.invoke({
            "user_input": prompt_user
        })

        print("Roteiro gerado com sucesso!")

        # Retorna apenas o conteúdo gerado pelo modelo
        return response.strip()