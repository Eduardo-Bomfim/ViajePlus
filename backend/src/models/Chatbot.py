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
            temperature=0.5,
            top_p=0.9,
            return_full_text=False,
            repetition_penalty=1.15,
        )

        self.llm = HuggingFacePipeline(pipeline=transformers_pipeline)

        prompt_system = """Sua única função é gerar um roteiro de viagem.
            Formate a resposta usando tabelas Markdown para cada dia.

            Use EXATAMENTE o seguinte formato Markdown para cada dia:

            **Dia 1: [TÍTULO CRIATIVO PARA O DIA]**

            | Período | Atividade | Dicas e Detalhes |
            |---|---|---|
            | Manhã | [Nome da atividade 1] | [Descrição ou dica útil sobre a atividade 1] |
            | Tarde | [Nome da atividade 2] | [Descrição ou dica útil sobre a atividade 2] |
            | Noite | [Nome da atividade 3] | [Descrição ou dica útil sobre a atividade 3] |

            REGRAS ABSOLUTAS:
            - Você DEVE começar a resposta diretamente com "**Dia 1**".
            - Você NÃO DEVE fazer perguntas, criar diálogos, saudações ou conclusões.
            - Sua resposta TERMINA estritamente após a tabela do último dia solicitado.
            - Concenstre-se EXCLUSIVAMENTE no destino fornecido pelo usuário. NÃO inclua outras cidades, estados ou países no roteiro.
        """

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