<?php

namespace App\Command;

use App\Repository\ConfigurationRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:upsert-config',
    description: 'Upsert configuration record',
    hidden: false
)]
class UpsertConfigurationCommand extends Command
{
    public function __construct(private readonly ConfigurationRepository $repository)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('module', InputArgument::REQUIRED);
        $this->addArgument('variable', InputArgument::REQUIRED);
        $this->addArgument('value', InputArgument::REQUIRED);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $module = $input->getArgument('module');
        $variable = $input->getArgument('variable');
        $value = $input->getArgument('value');

        $output->writeln(sprintf('Upsert %s/%s', $module, $variable));
        $this->repository->insertOrUpdate($module, [$variable => $value]);

        return Command::SUCCESS;
    }
}
