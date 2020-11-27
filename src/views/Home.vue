<template>
  <main>
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
          {{ bonosConPremioPorRepartir }}
        </span>
        <p>
          Bonos con premio restantes:
        </p>
      </div>
      <div class="mt-3 flex-auto">
        <span class="font-semibold text-3xl text-red-600">
          {{ bonosVaciosPorRepartir }}
        </span>
        <p>
          Bonos vacíos restantes:
        </p>
      </div>
    </div>
    <div
      class="grid grid-cols-3 gap-5 border-4 border-dashed border-gray-200 rounded-lg h-96 my-10 mx-5"
    >
      <div class="col-span-1 mt-5">
        <p class="text-gray-800 mb-3">
          Siguiente colaborador
        </p>
        <ul class="text-3xl text-blue-700">
          <li
            v-for="colaborador in colaboradoresRestantes.slice(0, 1)"
            :key="colaborador.id"
          >
            {{ colaborador.codigo }} - {{ colaborador.nombre }}
          </li>
        </ul>
      </div>
      <div class="col-span-2 mt-5">
        <div class="width-full">
          <button
            v-if="siguienteColaborador"
            type="button"
            class="rounded border border-green-500 bg-green-500 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-green-600 focus:outline-none focus:shadow-outline"
            @click="sortearPremio"
          >
            Sortear bono para {{ siguienteColaborador.nombre }}
          </button>
        </div>

        <!-- Lista de bonos pendientes -->
        <div v-if="listBonosVisible" class="bonos-pendientes-container w-full">
          <p class="mt-5">
            Bonos pendientes:
          </p>

          <div class="width-full mt-3">
            <div
              v-for="(bono, index) in listaDeBonos"
              :key="index"
              class="mr-5 mt-4 text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 rounded-full"
              :class="{
                'bg-green-200 text-green-700':
                  bono.premio === premio.CON_PREMIO,
                'bg-red-200 text-red-700':
                  bono.premio === premio.SIN_PREMIO,
                hidden: bono.oculto
              }"
            >
              <feather
                :type="
                  bono.premio === premio.CON_PREMIO
                    ? 'gift'
                    : 'cloud-rain'
                "
              ></feather>
              <span class="ml-1">Premio</span>
            </div>
          </div>
        </div>
        <!-- /Lista de bonos pendientes -->

        <!-- Lista de bonos para sortear -->
        <div
          v-if="bonosParaSorteoVisible"
          class="bonos-pendientes-container w-full"
        >
          <p class="mt-5 text-xl">
            Sorteando premios...
          </p>

          <div class="width-full mt-3">
            <template v-for="(bono, index) in bonosParaSorteo">
              <transition name="bounce" :key="index">
                <div
                  v-if="!bono.oculto"
                  class="mr-5 mt-4 text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 rounded-full"
                  :class="{
                    'bg-green-200 text-green-700':
                      bono.premio === premio.CON_PREMIO,
                    'bg-red-200 text-red-700':
                      bono.premio === premio.SIN_PREMIO
                  }"
                >
                  <feather
                    :type="
                      bono.premio === premio.CON_PREMIO
                        ? 'gift'
                        : 'cloud-rain'
                    "
                  ></feather>
                  <span class="ml-1">Premio</span>
                </div>
              </transition>
            </template>
          </div>
        </div>
        <!-- /Lista de bonos para sortear -->
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
      bonosParaSorteo: [],
      BONOS_PREMIADOS: 5,
      BONOS_VACIOS: 2,
      sorteoActivo: false,
      premio: {
        CON_PREMIO: "conPremio",
        SIN_PREMIO: "sinPremio",
        PENDIENTE: "pendiente"
      },
      listBonosVisible: true,
      bonosParaSorteoVisible: false,
      duracionSorteo: 10000
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
        item => item.premio === this.premio.PENDIENTE
      );
    },
    /**
     * Retorna el siguiente colaborador para participar en la rifa.
     *
     * @returns {Array<Object>}
     */
    siguienteColaborador() {
      return this.colaboradoresRestantes[0];
    },
    /**
     * Calcula los bonos que se darán, descontando los bonos vacíos
     *
     * @returns {number}
     */
    bonosConPremioPorRepartir() {
      const totalBonos = this.colaboradores.length;
      return totalBonos - this.bonosConPremioRepartidos - this.BONOS_VACIOS;
    },
    /**
     * Calcula el total de bonos premiados repartidos
     *
     * @returns {number}
     */
    bonosConPremioRepartidos() {
      return this.colaboradores.filter(
        item => item.premio === this.premio.CON_PREMIO
      ).length;
    },
    /**
     * Calcula el total de bonos vacíos repartidos
     *
     * @returns {number}
     */
    bonosVaciosRepartidos() {
      return this.colaboradores.filter(
        item => item.premio === this.premio.SIN_PREMIO
      ).length;
    },
    /**
     * Calcula los bonos vacíos que quedan por repartir.
     *
     * @returns {number}
     */
    bonosVaciosPorRepartir() {
      return this.BONOS_VACIOS - this.bonosVaciosRepartidos;
    },
    /**
     * Función que retorna un arreglo con los bonos premiados y vacíos por otorgar.
     *
     * @returns {Array<Object>}
     */
    listaDeBonos() {
      let bonosPendientes = [];

      // Agrega primero, los bonos con premio pendientes
      for (let i = 0; i < this.bonosConPremioPorRepartir; i++) {
        bonosPendientes.push({
          premio: this.premio.CON_PREMIO,
          oculto: false
        });
      }

      // Agrega los bonos sin premio pendientes
      for (let i = 0; i < this.bonosVaciosPorRepartir; i++) {
        bonosPendientes.push({
          premio: this.premio.SIN_PREMIO,
          oculto: false
        });
      }

      return bonosPendientes.sort(() => Math.random() - 0.5);
    }
  },
  methods: {
    /**
     * Función que inicia la interacción para el sorteo de bono para el siguiente colaborador.
     */
    async sortearPremio() {
      // Precarga la lista de bonos para el sorteo con los bonos pendientes
      this.bonosParaSorteo = this.listaDeBonos;

      // Oculta la lista de bonosPendientes, para mosstrar la lista bonosParaSorteo
      this.listBonosVisible = false;

      // Muestra la lista bonosParaSorteo
      this.bonosParaSorteoVisible = true;
      let duracion = this.duracionSorteo / this.bonosParaSorteo.length;

      // Crea una array de enteros para las posiciones de los bonos
      let arrayPosiciones = [];

      for (let i = 0; i < this.bonosParaSorteo.length; i++) {
        arrayPosiciones.push(i);
      }

      // Reordena las posiciones
      arrayPosiciones = this.shuffle(arrayPosiciones);

      // Inicia a ocultar bonos, con contador en 1, para dejar 1 sólo premio
      for (let i = 1; i < this.bonosParaSorteo.length; i++) {
        await new Promise(r => setTimeout(r, duracion));
        this.bonosParaSorteo[arrayPosiciones[i]].oculto = true;
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
    colaboradores: db.collection("colaboradores").orderBy("turno", "asc")
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
