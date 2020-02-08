Vagrant.configure("2") do |config|

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search. We use our own boxes which can be found at
  # https://atlas.hashicorp.com/boxes/search?utf8=%E2%9C%93&sort=&provider=&q=fso
  config.vm.box = "fso/xenial64"
  config.vm.hostname = "specialhandling"
  config.vm.network "forwarded_port", guest: 8000, host: 8000

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VMware Fusion:
  config.vm.provider "virtualbox" do |vb|
    vb.memory = 2048
    vb.cpus = 2
  end

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"
  config.vm.synced_folder ".", "/var/www/specialhandling",
    owner: "vagrant", group: "vagrant"

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell" do |s|
    s.path = "setup/scripts/local.bash"
    s.args = "'specialhandling'"
  end
end
