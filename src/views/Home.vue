<template>
  <main>
    <!-- HEADER Details -->
    <div class="mt-5 details-container flex w-full">
      <div class="mt-3 flex-auto">
        <span class="font-semibold text-3xl text-blue-700">
          {{ colaboradoresRestantes.length }}
        </span>
        <p>
          Colaboradores restantes:
        </p>
      </div>
      <div class="mt-3 flex-auto">
        <span class="font-semibold text-3xl text-green-600">
          {{ regalosConPremioRestantes }}
        </span>
        <p>
          Regalos con premio restantes:
        </p>
      </div>
      <div class="mt-3 flex-auto">
        <span class="font-semibold text-3xl text-red-600">
          {{ regalosSinPremiosRestantes }}
        </span>
        <p>
          Regalos sin premios restantes:
        </p>
      </div>
    </div>
    <!-- /HEADER Details -->

    <div
      class="grid grid-cols-3 gap-5 border-4 border-dashed border-gray-200 rounded-lg h-96 my-10 mx-5"
    >
      <div class="col-span-1 mt-5">
        <div class="width-full">
          <button
            type="button"
            class="rounded border border-blue-500 bg-blue-500 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-blue-600 focus:outline-none focus:shadow-outline"
            @click="obtenerSiguienteParticipanteClick"
          >
            Elegir siguiente participante
          </button>
        </div>
        <p class="text-gray-800 mt-5 mb-3">
          Participante actual:
        </p>
        <p class="text-3xl text-blue-700">
          <span v-if="colaboradorActivo">
            {{ colaboradorActivo.codigo }} - {{ colaboradorActivo.nombre }}
          </span>
          <span v-else>
            {{ animacionSiguienteColaborador.nombre }}
          </span>
        </p>
      </div>
      <div class="col-span-2 mt-5">
        <div class="width-full">
          <button
            v-if="colaboradorActivo"
            type="button"
            class="rounded border border-green-500 bg-green-500 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-green-600 focus:outline-none focus:shadow-outline"
            @click="sortearPremio"
          >
            Sortear bono para {{ colaboradorActivo.nombre }}
          </button>
        </div>

        <!-- Lista de premios pendientes -->
        <div
          v-if="listPremiosVisible"
          class="premios-pendientes-container w-full"
        >
          <p class="mt-5">
            Premios pendientes:
          </p>
          <div class="width-full mt-3">
            <div
              v-for="(premio, index) in listaDePremios"
              :key="index"
              class="mr-5 mt-4 text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 rounded-full"
              :class="{
                'bg-green-200 text-green-700': premio.monto !== '$0,00',
                'bg-red-200 text-red-700': premio.monto === '$0,00',
                hidden: premio.oculto
              }"
            >
              <feather
                :type="premio.monto !== '$0,00' ? 'gift' : 'cloud-rain'"
              ></feather>
              <span class="ml-1">{{ premio.monto }}</span>
            </div>
          </div>
        </div>
        <!-- /Lista de premios pendientes -->

        <!-- Lista de premios para sortear -->
        <div
          v-if="premiosParaSorteoVisible"
          class="premios-pendientes-container w-full"
        >
          <p class="mt-5 text-xl">
            Sorteando premios...
          </p>

          <div class="width-full mt-3">
            <template v-for="(premio, index) in premiosParaSorteo">
              <transition name="bounce" :key="index">
                <div
                  v-if="!premio.oculto"
                  class="mr-5 mt-4 text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 rounded-full"
                  :class="{
                    'bg-green-200 text-green-700': premio.monto !== '$0,00',
                    'bg-red-200 text-red-700': premio.monto === '$0,00'
                  }"
                >
                  <feather
                    :type="premio.monto !== '$0,00' ? 'gift' : 'cloud-rain'"
                  ></feather>
                  <span class="ml-1">{{ premio.monto }}</span>
                </div>
              </transition>
            </template>
          </div>
        </div>
        <!-- /Lista de premios para sortear -->
      </div>
    </div>
  </main>
</template>

<script>
import { db } from "@/firebase/firebaseConnection";

export default {
  name: "Home",
  data() {
    return {
      colaboradores: [],
      premios: [],
      colaboradorActivo: null,
      animacionSiguienteColaborador: { nombre: "" },
      premiosParaSorteo: [],
      BONOS_PREMIADOS: 5,
      BONOS_VACIOS: 2,
      sorteoActivo: false,
      estatus: {
        CON_PREMIO: "conPremio",
        SIN_PREMIO: "sinPremio",
        PENDIENTE: "pendiente"
      },
      listPremiosVisible: true,
      premiosParaSorteoVisible: false,
      duracionSorteo: 7000
    };
  },
  computed: {
    /**
     * Regresa la lista de colaboradores que faltan por recibir premio.
     *
     * @returns {Array<Object>}
     */
    colaboradoresRestantes() {
      return this.colaboradores.filter(
        item => item.premio === this.estatus.PENDIENTE
      );
    },
    /**
     * Calcula los bonos que se darán, descontando los bonos vacíos
     *
     * @returns {number}
     */
    regalosConPremioRestantes() {
      return this.premios.filter(item => item.monto !== "$0,00").length;
    },
    /**
     * Calcula los bonos vacíos que quedan por repartir.
     *
     * @returns {number}
     */
    regalosSinPremiosRestantes() {
      return this.premios.filter(item => item.monto === "$0,00").length;
    },
    /**
     * Función que retorna un arreglo con los bonos premiados y vacíos por otorgar.
     *
     * @returns {Array<Object>}
     */
    listaDePremios() {
      let bonosPendientes = [];

      for (let i = 0; i < this.premios.length; i++) {
        bonosPendientes.push({
          premio: this.estatus.CON_PREMIO,
          monto: this.premios[i].monto,
          oculto: false
        });
      }

      return bonosPendientes.sort(() => Math.random() - 0.5);
    }
  },
  methods: {
    /**
     * Método que permie obtener al siguiente participante.
     */
    async obtenerSiguienteParticipanteClick() {
      this.colaboradorActivo = null;
      let duracionAnimacion = 100;
      let randomValue = Math.random() * (50 - 25) + 25;

      for (let i = 1; i < randomValue; i++) {
        await new Promise(r => setTimeout(r, duracionAnimacion));
        this.animacionSiguienteColaborador = this.colaboradores[i];
      }
      this.colaboradorActivo = this.animacionSiguienteColaborador;
      this.animacionSiguienteColaborador = { nombre: "" };
    },
    /**
     * Función que inicia la interacción para el sorteo de bono para el siguiente colaborador.
     */
    async sortearPremio() {
      // Precarga la lista de bonos para el sorteo con los bonos pendientes
      this.premiosParaSorteo = this.listaDePremios;

      // Oculta la lista de bonosPendientes, para mosstrar la lista premiosParaSorteo
      this.listPremiosVisible = false;

      // Muestra la lista premiosParaSorteo
      this.premiosParaSorteoVisible = true;
      let duracion = this.duracionSorteo / this.premiosParaSorteo.length;

      // Crea una array de enteros para las posiciones de los bonos
      let arrayPosiciones = [];

      for (let i = 0; i < this.premiosParaSorteo.length; i++) {
        arrayPosiciones.push(i);
      }

      // Reordena las posiciones
      arrayPosiciones = this.shuffle(arrayPosiciones);

      // Inicia a ocultar bonos, con contador en 1, para dejar 1 sólo premio
      for (let i = 1; i < this.premiosParaSorteo.length; i++) {
        await new Promise(r => setTimeout(r, duracion));
        this.premiosParaSorteo[arrayPosiciones[i]].oculto = true;
      }
    },
    /**
     * Método que recibe un array de elementos y los retorna en orden aleatorio.
     *
     * @param array Array de elementos a barajar
     * @returns {Array<number>}
     */
    shuffle(array) {
      let currentIndex = array.length,
        temporaryValue,
        randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }
  },

  firestore: {
    colaboradores: db.collection("colaboradores").orderBy("turno", "asc"),
    premios: db.collection("premios").orderBy("id")
  }
};
</script>

<style lang="scss" scoped>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
</style>
