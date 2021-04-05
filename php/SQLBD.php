<?php

class SQLBD
{
    public $pdo;
    private $error;

    function __construct()
    {
        $this->connect();
    }

    function prep_query($query)
    {
        return $this->pdo->prepare($query);
    }

    function connect()
    {
        if (!$this->pdo) {
            $database_name = 'sparrow';
            $database_host = 'localhost';
            $database_user = 'root';
            $database_pass = 'larevedere';
            $dsn = 'mysql:dbname=' . $database_name . ';host=' . $database_host . ';charset=utf8';
            $user = $database_user;
            $password = $database_pass;

            try {
                $this->pdo = new PDO($dsn, $user, $password, array(PDO::ATTR_PERSISTENT => true));
                return true;
            } catch (PDOException $e) {
                $this->error = $e->getMessage();
                die($this->error);
                return false;
            }
        } else {
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
            return true;
        }
    }

    function execute($query, $values = null)
    {
        if ($values == null) {
            $values = array();
        } else if (!is_array($values)) {
            $values = array($values);
        }
        $stmt = $this->prep_query($query);

        $stmt->execute($values);
        return $stmt;
    }

    function get($query, $values = null)
    {
        if ($values == null) {
            $values = array();
        } else if (!is_array($values)) {
            $values = array($values);
        }
        $stmt = $this->execute($query, $values);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    function getAll($query, $values = null, $key = null)
    {
        if ($values == null) {
            $values = array();
        } else if (!is_array($values)) {
            $values = array($values);
        }
        $stmt = $this->execute($query, $values);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($key != null && $results[0][$key]) {
            $keyed_results = array();
            foreach ($results as $result) {
                $keyed_results[$result[$key]] = $result;
            }
            $results = $keyed_results;
        }
        return $results;
    }

    function getArray($query, $column)
    {
        $stmt = $this->execute($query);
        $resarray = [];
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($results as $result) {
            if (array_key_exists($column, $result)) {
                array_push($resarray, $result[$column]);
            }
        }
        return $resarray;
    }

    function lastInsertId()
    {
        return $this->pdo->lastInsertId();
    }
}
