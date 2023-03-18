
import constants from "../constants/constants";
import designToolboxConstants from "../components/design/designToolboxConstants";

enum CassandraKeyType {
    PARTITION_KEY = "partitionKey",
    CLUSTERING_KEY = "clustering"
};

enum ClusteringOrder {
    ASCENDING = "ASC",
    DESCENDING = "DESC"
};

interface Concept {
    conceptName: string,
    conceptType: string
};

interface ClusteringOptions {
    clusteringColumn: string,
    clusteringOrder: ClusteringOrder
}

interface Command {
    lineNumber: number,
    lineContent: string
};

export function useQuery() {
    let keyspace: string, tableConcepts: Concept[], columnConcepts: object, dataTypeConcepts: object;
    let commands: Command[] = [];
    let currentLine: number = 0;
    let tableConceptName: string;
    let clusteringOptions: ClusteringOptions;

    const initializeQueryHelperData = (currentKeyspace, currentTableConcepts, currentColumnConcepts, currentDataTypeConcepts, currentClusteringOptons) => {
        keyspace = currentKeyspace;
        
        tableConcepts = { ... currentTableConcepts};
        columnConcepts = { ... currentColumnConcepts };
        dataTypeConcepts = { ... currentDataTypeConcepts };
        clusteringOptions = { ... currentClusteringOptons };
        
        tableConceptName = tableConcepts[0].conceptName;
        commands = [];
        currentLine = 0;
    }

    const addCQLLineToCommandsArray = (cqlLineContent: string): void => {
        commands.push({ lineNumber: currentLine, lineContent: cqlLineContent });
        currentLine = currentLine + 1;
    };

    const computeCQLStarterLine = (): void => {
        const definitionCommandContent = designToolboxConstants.CQL_BASH_COMMAND
          .concat(designToolboxConstants.CQL_CREATE_TABLE_SNIPPET)
          .concat(keyspace)
          .concat(designToolboxConstants.CQL_PUNCTUATION.DOT)
          .concat(tableConceptName)
          .concat(" (");

        addCQLLineToCommandsArray(definitionCommandContent);
    };

    const computeCQLColumnDefinitionLines = (): void => {
        columnConcepts[tableConceptName].forEach(columnConcept => {
            const columnConceptCommandContent = designToolboxConstants.CQL_BASH_BLANK_COMMAND
              .concat(columnConcept.conceptName)
              .concat(designToolboxConstants.CQL_PUNCTUATION.SPACE)
              .concat(dataTypeConcepts[columnConcept.conceptName].conceptName.toUpperCase())
              .concat(designToolboxConstants.CQL_PUNCTUATION.COMMA);
        
            addCQLLineToCommandsArray(columnConceptCommandContent);
        });
    };

    const computeKeysSnippetFromTokens = (tokens: string[]): string => {
        let snippet: string = constants.inputValues.empty;
        if (tokens.length === 0) {
            return snippet;
        } else if (tokens.length === 1) {
            return tokens[0];
        } else {
            snippet = "(";
            tokens.forEach(token => {
                snippet = snippet.concat(token)
                    .concat(designToolboxConstants.CQL_PUNCTUATION.COMMA)
                    .concat(designToolboxConstants.CQL_PUNCTUATION.SPACE);
            });
            debugger
            snippet = snippet.slice(0, snippet.length - 2).concat(")");
        }
        return snippet;
    }

    const getTokensForCassandraKeys = (): [string[], string[]] => {
        let partitionKeyTokens: string[] = [];
        let clusteringTokens: string[] = [];

        columnConcepts[tableConceptName].forEach((columnConcept: { kind: CassandraKeyType, conceptName: string }) => {
            if (columnConcept.kind === CassandraKeyType.PARTITION_KEY) {
              partitionKeyTokens.push(columnConcept.conceptName);
            } else if (columnConcept.kind === CassandraKeyType.CLUSTERING_KEY) {
              clusteringTokens.push(columnConcept.conceptName);
            }
          });

        return [partitionKeyTokens, clusteringTokens];
    }

    const computeCQLKeysDefinitionLines = (): void => {
        let [partitionKeyTokens, clusteringTokens] = getTokensForCassandraKeys();
        let partitionKeysSnippet = computeKeysSnippetFromTokens(partitionKeyTokens);
        let clusteringKeysSnippet = computeKeysSnippetFromTokens(clusteringTokens);
        
        if (partitionKeysSnippet !== constants.inputValues.empty && clusteringKeysSnippet) {
            partitionKeysSnippet = partitionKeysSnippet.concat(designToolboxConstants.CQL_PUNCTUATION.COMMA).concat(designToolboxConstants.CQL_PUNCTUATION.SPACE);
        }
        
        if (clusteringKeysSnippet) {
            clusteringKeysSnippet = designToolboxConstants.CQL_PUNCTUATION.SPACE
                                    .concat(clusteringKeysSnippet);
        }
        let primaryKeyCommandSnippet = `${designToolboxConstants.CQL_BASH_BLANK_COMMAND}PRIMARY KEY (${partitionKeysSnippet}${clusteringKeysSnippet})`;

        addCQLLineToCommandsArray(primaryKeyCommandSnippet);
    };

    const computeCQLClusteringOptionsLines = (): void => {
        addCQLLineToCommandsArray(designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat(")"));
        const clusteringOptionsLine = `WITH CLUSTERING ORDER BY (${clusteringOptions.clusteringColumn} ${clusteringOptions.clusteringOrder})`;
        addCQLLineToCommandsArray(designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat(clusteringOptionsLine));
    }

    const computeCQLEndingLine = () => {
        const cqlEndingLine = designToolboxConstants.CQL_BASH_BLANK_COMMAND.concat(");");
        addCQLLineToCommandsArray(cqlEndingLine);
    }

    const generateQueryAsCommands = (currentKeyspace: string, 
                                     currentTableConcepts: Concept[], 
                                     currentColumnConcepts: object, 
                                     currentDataTypeConcepts: object,
                                     currentClusteringOptons: ClusteringOptions): Command[] => {
                                        
        initializeQueryHelperData(currentKeyspace, currentTableConcepts, currentColumnConcepts, currentDataTypeConcepts, currentClusteringOptons);
        
        computeCQLStarterLine();
        computeCQLColumnDefinitionLines();
        computeCQLKeysDefinitionLines();
        
        if (currentClusteringOptons.clusteringColumn) {
            computeCQLClusteringOptionsLines();
        }
        
        computeCQLEndingLine();
        return commands;
    }

    const generateQueryAsString = (commands: Command[]) => {
        const queryFromCommands = commands.reduce((accumulator, currentValue) => accumulator.concat(currentValue.lineContent), constants.inputValues.empty);
        return queryFromCommands.replace(designToolboxConstants.CQL_COMMAND_REGEX, constants.inputValues.empty);
    }

    return {
        generateQueryAsCommands,
        generateQueryAsString
    };
}