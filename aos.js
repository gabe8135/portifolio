import styles from './../sass/aos.scss';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import observe from './libs/observer';
import detect from './helpers/detector';
import handleScroll from './helpers/handleScroll';
import prepare from './helpers/prepare';
import elements from './helpers/elements';

/**
 * *******************************************************
 * AOS (Animate on scroll) - uma alternativa ao wowjs
 * feito para animar elementos ao rolar para cima e para baixo
 * *******************************************************
 */


// Módulos e ajudantes



/**
 * Variáveis privadas
 */
let $aosElements = [];
let initialized = false;

/**
 * Opções padrão
 */
let options = {
    offset: 120,
    delay: 0,
    easing: 'ease',
    duration: 400,
    disable: false,
    once: false,
    startEvent: 'DOMContentLoaded',
    throttleDelay: 99,
    debounceDelay: 50,
    disableMutationObserver: false,
};

/**
 * Atualizar AOS
 */
const refresh = function refresh(initialize = false) {
    // Permitir atualização apenas quando foi inicializado pela primeira vez no startEvent
    if (initialize) initialized = true;

    if (initialized) {
        // Estender objetos de elementos em $aosElements com suas posições
        $aosElements = prepare($aosElements, options);
        // Executar evento de rolagem, para atualizar a visualização e mostrar/ocultar elementos
        handleScroll($aosElements, options.once);

        return $aosElements;
    }
};

/**
 * Atualização completa
 * criar array com novos elementos e acionar atualização
 */
const refreshHard = function refreshHard() {
    $aosElements = elements();
    refresh();
};

/**
 * Desativar AOS
 * Remover todos os atributos para redefinir os estilos aplicados
 */
const disable = function() {
    $aosElements.forEach(function(el, i) {
        el.node.removeAttribute('data-aos');
        el.node.removeAttribute('data-aos-easing');
        el.node.removeAttribute('data-aos-duration');
        el.node.removeAttribute('data-aos-delay');
    });
};


/**
 * Verificar se o AOS deve ser desativado com base na configuração fornecida
 */
const isDisabled = function(optionDisable) {
    return optionDisable === true ||
    (optionDisable === 'mobile' && detect.mobile()) ||
    (optionDisable === 'phone' && detect.phone()) ||
    (optionDisable === 'tablet' && detect.tablet()) ||
    (typeof optionDisable === 'function' && optionDisable() === true);
};

/**
 * Inicializando AOS
 * - Criar opções mesclando padrões com opções definidas pelo usuário
 * - Definir atributos no <body> como configuração global - o CSS depende disso
 * - Anexar preparação de elementos ao options.startEvent,
 *   redimensionamento da janela e mudança de orientação
 * - Anexar função que manipula a rolagem e tudo relacionado a ela
 *   ao evento de rolagem da janela e disparar uma vez que o documento esteja pronto para definir o estado inicial
 */
const init = function init(settings) {
    options = Object.assign(options, settings);

    // Criar array inicial com elementos -> para ser preenchido posteriormente com prepare()
    $aosElements = elements();

    // Detectar navegadores não suportados (<=IE9)
    // http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
    const browserNotSupported = document.all && !window.atob;

    /**
     * Não inicializar o plugin se a opção `disable` estiver definida
     * ou quando o navegador não for suportado
     */
    if (isDisabled(options.disable) || browserNotSupported) {
        return disable();
    }

    /**
     * Definir configurações globais no body, com base nas opções
     * para que o CSS possa usá-las
     */
    document.querySelector('body').setAttribute('data-aos-easing', options.easing);
    document.querySelector('body').setAttribute('data-aos-duration', options.duration);
    document.querySelector('body').setAttribute('data-aos-delay', options.delay);

    /**
     * Lidar com a inicialização
     */
    if (options.startEvent === 'DOMContentLoaded' &&
        ['complete', 'interactive'].indexOf(document.readyState) > -1) {
        // Inicializar AOS se o startEvent padrão já tiver sido disparado
        refresh(true);
    } else if (options.startEvent === 'load') {
        // Se o evento de início for 'Load' - anexar ouvinte à janela
        window.addEventListener(options.startEvent, function() {
            refresh(true);
        });
    } else {
        // Ouvir options.startEvent e inicializar AOS
        document.addEventListener(options.startEvent, function() {
            refresh(true);
        });
    }

    /**
     * Atualizar o plugin ao redimensionar a janela ou alterar a orientação
     */
    window.addEventListener('resize', debounce(refresh, options.debounceDelay, true));
    window.addEventListener('orientationchange', debounce(refresh, options.debounceDelay, true));

    /**
     * Lidar com o evento de rolagem para animar elementos ao rolar
     */
    window.addEventListener('scroll', throttle(() => {
        handleScroll($aosElements, options.once);
    }, options.throttleDelay));

    /**
     * Observar elementos [aos]
     * Se algo for carregado por AJAX
     * ele atualizará o plugin automaticamente
     */
    if (!options.disableMutationObserver) {
        observe('[data-aos]', refreshHard);
    }

    return $aosElements;
};

/**
 * Exportar API pública
 */

module.exports = {
    init,
    refresh,
    refreshHard
};
