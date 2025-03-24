// src/i18n.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      aboutPage: {
        overviewTitle: 'About FASTR DHIS2 Data Downloader',
        welcomeText:
          'Welcome to the FASTR DHIS2 Data Downloader, your go-to solution for easily extracting data from DHIS2 data systems.',
        features: {
          title: 'Features',
          downloadingData: {
            title: 'Downloading Data from DHIS2',
            description:
              'Download DHIS2 data by selecting date ranges, data elements/indicators, organization levels, units, and disaggregated dimensions. Data is downloaded in CSV format.',
            requirements: 'Using the FASTR DHIS2 Data Downloader requires:',
            requirementsList: ['URL of the DHIS2 instance', 'Valid username', 'Valid password'],
            note: 'Note: The FASTR DHIS2 Data Downloader does not handle DHIS2 account registration. It can only access DHIS2 systems for which you have valid credentials. The Downloader will not transmit or store your DHIS2 credentials anywhere other than on your laptop.'
          },
          dataDictionary: {
            title: 'Data Dictionary',
            description:
              'Search for data elements/indicators by name or JSON ID. Access additional metadata and download it as a CSV file.'
          },
          downloadHistory: {
            title: 'Managing Download History',
            description:
              'Record successful downloads, add notes, and quickly re-download past records. Option to keep or erase history upon logging out.'
          },
          facilityInfo: {
            title: 'Accessing Facility Information',
            description:
              'The facility table feature offers a list of all health facilities registered in the DHIS2 system, along with key attributes, which can be exported as a CSV file. Additionally, the facility map feature allows you to view all facilities with GPS coordinates in a map format.'
          }
        },
        faq: {
          title: 'Frequently Asked Questions (FAQ)',
          q1: {
            question: 'Why Do I Need to Select a Chunk Size?',
            answer:
              "Chunk size refers to how many periods of data are grouped together. Always select the appropriate chunk size based on your country's DHIS2 system situations."
          },
          q2: {
            question: 'Why did the download fail, and how can I find out what went wrong?',
            answer1:
              'The data downloader produces a log of errors. Here are some common errors with an explanation and suggestions for solutions.',
            answer2:
              'Error: "Cannot read properties of null (reading \'textContent\')" – This usually happens when the requested time periods or indicators are missing. To troubleshoot:',
            requirements: [
              'Make sure you’ve selected the correct time periods and data indicators before starting the download.',
              'This error won’t interrupt the data download process. When a request fails, the system will continue, and you can review any failed requests once the download is complete.'
            ],
            answer3:
              'Error: "HTTP Status 500 – Internal Server Error" – This usually means there’s an issue with the server, often due to a disconnection. To troubleshoot:',
            serverIssues: [
              'Ensure all required data fields (like time periods and data elements/indicators) are selected.',
              'Verify that your login credentials are correct.',
              'Check that the server is up and not experiencing any issues.'
            ]
          },
          q3: {
            question:
              'Why do I need to change the filename even though it says the file will be replaced?',
            answer:
              'The downloader splits large requests into smaller parts and then combines them into a single file. To avoid confusion, give each new download a unique name to ensure the data is correctly added.'
          },
          q4: {
            question: 'How can I avoid download timeouts with large data requests?',
            answer:
              'Downloads have a 1-hour time limit, meaning requests that take longer than 1 hour will automatically time out. To avoid this, split your requests into smaller batches.'
          },
          q5: {
            question: 'How much data can I download into an Excel file?',
            answer:
              'Excel can handle around 1 million rows. To manage this, try downloading the data in smaller batches. If you exceed Excel’s capacity, you can still open the CSV file in statistical software to access the full dataset.'
          }
        },
        resources: {
          title: 'Additional Resources',
          description:
            'Learn more about how to use the FASTR DHIS2 Data Downloader by visiting our Training Resources. The code is accessible via GitHub under BSD-2 License.'
        },
        team: {
          title: 'Our Team',
          description:
            'The FASTR DHIS2 Data Downloader was developed by the Results and Learning team at the Global Financing Facility for Women, Children and Adolescents (GFF).'
        },
        contact: {
          title: 'Get In Touch',
          contactText: 'For support, feedback, or inquiries, contact us at:',
          emailLabel: 'Email',
          email: 'fastr@worldbank.org',
          sendMessageTitle: 'Send us a message',
          messagePlaceholder: 'Type your message here...',
          sendButton: 'Send Email'
        },
        acknowledgements: {
          title: 'Acknowledgements',
          description:
            'We would like to thank Damola Sheriff Olajide with the West African Health Organization who provided the software prototype for the FASTR DHIS2 Data Downloader.'
        }
      }
    }
  },
  fr: {
    translation: {
      aboutPage: {
        overviewTitle: 'À propos de FASTR DHIS2 Data Downloader',
        welcomeText:
          'Bienvenue sur FASTR DHIS2 Data Downloader, votre solution pour extraire facilement des données des systèmes DHIS2.',
        features: {
          title: 'Fonctionnalités',
          downloadingData: {
            title: 'Téléchargement des données de DHIS2',
            description:
              "Téléchargez les données DHIS2 en sélectionnant des plages de dates, des éléments/indicateurs, des niveaux d'organisation, des unités, et des dimensions désagrégées. Les données sont téléchargées au format CSV.",
            requirements: "L'utilisation de FASTR DHIS2 Data Downloader nécessite :",
            requirementsList: [
              "URL de l'instance DHIS2",
              "Nom d'utilisateur valide",
              'Mot de passe valide'
            ],
            note: "Note : FASTR DHIS2 Data Downloader ne gère pas l'inscription aux comptes DHIS2. Il peut uniquement accéder aux systèmes DHIS2 pour lesquels vous disposez d'identifiants valides. Le Downloader ne transmettra ni ne stockera vos identifiants DHIS2 ailleurs que sur votre ordinateur."
          },
          dataDictionary: {
            title: 'Dictionnaire de données',
            description:
              'Recherchez des éléments/indicateurs par nom ou par identifiant JSON. Accédez à des métadonnées supplémentaires et téléchargez-les sous forme de fichier CSV.'
          },
          downloadHistory: {
            title: "Gestion de l'historique des téléchargements",
            description:
              "Enregistrez les téléchargements réussis, ajoutez des notes, et retéléchargez rapidement des enregistrements passés. Option de conserver ou d'effacer l'historique lors de la déconnexion."
          },
          facilityInfo: {
            title: 'Accès aux informations des établissements de santé',
            description:
              'La fonctionnalité de tableau des établissements offre une liste de tous les établissements de santé enregistrés dans le système DHIS2, avec des attributs clés, qui peuvent être exportés en fichier CSV. De plus, la fonctionnalité de carte permet de visualiser tous les établissements avec des coordonnées GPS sous forme de carte.'
          }
        },
        faq: {
          title: 'Questions Fréquemment Posées (FAQ)',
          q1: {
            question: 'Pourquoi dois-je sélectionner une taille de segment ?',
            answer:
              'La taille du segment fait référence au nombre de périodes de données regroupées ensemble. Sélectionnez toujours la taille de segment appropriée en fonction des particularités du système DHIS2 de votre pays.'
          },
          q2: {
            question:
              "Pourquoi le téléchargement a-t-il échoué et comment puis-je savoir ce qui s'est mal passé ?",
            answer1:
              "Le téléchargeur de données génère un journal des erreurs. Voici quelques erreurs courantes accompagnées d'une explication et des suggestions pour les résoudre.",
            answer2:
              'Erreur : "Impossible de lire les propriétés de null (lecture de \'textContent\')" – Cela se produit généralement lorsque les périodes ou indicateurs demandés sont absents. Pour résoudre le problème :',
            requirements: [
              "Assurez-vous d'avoir sélectionné les périodes et indicateurs corrects avant de démarrer le téléchargement.",
              "Cette erreur n'interrompt pas le processus de téléchargement. En cas d'échec d'une requête, le système continue et vous pourrez consulter les requêtes échouées une fois le téléchargement terminé."
            ],
            answer3:
              'Erreur : "HTTP Status 500 – Internal Server Error" – Cela signifie généralement qu\'il y a un problème avec le serveur, souvent dû à une déconnexion. Pour résoudre le problème :',
            serverIssues: [
              'Assurez-vous que tous les champs requis (comme les périodes et les éléments/indicateurs) sont sélectionnés.',
              'Vérifiez que vos identifiants sont corrects.',
              'Vérifiez que le serveur fonctionne et ne rencontre pas de problème.'
            ]
          },
          q3: {
            question:
              "Pourquoi dois-je changer le nom de fichier même s'il est indiqué que le fichier sera remplacé ?",
            answer:
              'Le téléchargeur divise les grandes requêtes en parties plus petites, puis les combine en un seul fichier. Pour éviter toute confusion, attribuez un nom unique à chaque nouveau téléchargement afin que les données soient correctement ajoutées.'
          },
          q4: {
            question:
              "Comment puis-je éviter les délais d'attente lors du téléchargement de grandes quantités de données ?",
            answer:
              "Les téléchargements ont une limite d'une heure, ce qui signifie que les requêtes dépassant cette durée échoueront automatiquement. Pour éviter cela, divisez vos requêtes en lots plus petits."
          },
          q5: {
            question: 'Combien de données puis-je télécharger dans un fichier Excel ?',
            answer:
              "Excel peut gérer environ 1 million de lignes. Pour gérer cela, essayez de télécharger les données par lots plus petits. Si vous dépassez la capacité d'Excel, vous pourrez toujours ouvrir le fichier CSV dans un logiciel statistique pour accéder à l'ensemble des données."
          }
        },
        resources: {
          title: 'Ressources Supplémentaires',
          description:
            "En savoir plus sur l'utilisation du FASTR DHIS2 Data Downloader en visitant nos Ressources de Formation. Le code est accessible via GitHub sous licence BSD-2."
        },
        team: {
          title: 'Notre Équipe',
          description:
            "Le FASTR DHIS2 Data Downloader a été développé par l'équipe Results and Learning du Global Financing Facility for Women, Children and Adolescents (GFF)."
        },
        contact: {
          title: 'Contactez-nous',
          contactText: 'Pour assistance, retours ou demandes, contactez-nous à :',
          emailLabel: 'Email',
          email: 'fastr@worldbank.org',
          sendMessageTitle: 'Envoyez-nous un message',
          messagePlaceholder: 'Tapez votre message ici...',
          sendButton: "Envoyer l'Email"
        },
        acknowledgements: {
          title: 'Remerciements',
          description:
            "Nous remercions Damola Sheriff Olajide avec l'Organisation Ouest Africaine de la Santé qui a fourni le prototype logiciel du FASTR DHIS2 Data Downloader."
        }
      }
    }
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  },
  debug: true
})

export default i18n
